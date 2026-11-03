// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const verifyIdToken = vi.fn()
const getPayload = vi.fn()

vi.mock('@/lib/firebase-admin', () => ({
  getFirebaseAdminAuth: () => ({ verifyIdToken }),
}))
vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))

const { POST } = await import('@/app/api/auth/firebase/route')
const { firebaseStrategy } = await import('@/auth/firebaseStrategy')
const { isAllowedAdminEmail } = await import('@/auth/adminAllowlist')

const login = (idToken = 'token') =>
  POST(
    new Request('http://localhost/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }),
  )

describe('admin Google login allowlist', () => {
  beforeEach(() => {
    verifyIdToken.mockReset()
    getPayload.mockReset()
  })

  it('matches allowlisted emails case-insensitively and rejects others', () => {
    expect(isAllowedAdminEmail('letstour.in@gmail.com')).toBe(true)
    expect(isAllowedAdminEmail(' LetsTour.IN@gmail.com ')).toBe(true)
    expect(isAllowedAdminEmail('stranger@gmail.com')).toBe(false)
    expect(isAllowedAdminEmail(undefined)).toBe(false)
    expect(isAllowedAdminEmail('')).toBe(false)
  })

  it('rejects a non-allowlisted Google account with 403 before any database lookup', async () => {
    verifyIdToken.mockResolvedValue({ email: 'stranger@gmail.com', email_verified: true })

    const res = await login()

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      error: 'This Google account is not authorized to access the admin.',
    })
    expect(res.headers.get('set-cookie')).toBeNull()
    expect(getPayload).not.toHaveBeenCalled()
  })

  it('lets an allowlisted admin through and sets the session cookie', async () => {
    verifyIdToken.mockResolvedValue({ email: 'letstour.in@gmail.com', email_verified: true })
    const find = vi.fn().mockResolvedValue({ docs: [{ id: '1', role: 'admin' }] })
    getPayload.mockResolvedValue({ find })

    const res = await login()

    expect(res.status).toBe(200)
    expect(find).toHaveBeenCalledOnce()
    expect(res.headers.get('set-cookie')).toContain('firebase-token=')
  })

  it('auth strategy returns no user for a non-allowlisted token without querying users', async () => {
    verifyIdToken.mockResolvedValue({ email: 'stranger@gmail.com', email_verified: true })
    const find = vi.fn()

    const result = await firebaseStrategy.authenticate({
      headers: new Headers({ authorization: 'Bearer token' }),
      payload: { find } as any,
    } as any)

    expect(result).toEqual({ user: null })
    expect(find).not.toHaveBeenCalled()
  })
})
