import type { AuthStrategy } from 'payload'
import { getFirebaseAdminAuth } from '@/lib/firebase-admin'
import { isAllowedAdminEmail } from '@/auth/adminAllowlist'

export const firebaseStrategy: AuthStrategy = {
  name: 'firebase',

  authenticate: async ({ headers, payload }) => {
    const cookieHeader = headers.get('cookie') || ''

    const firebaseCookie = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('firebase-token='))

    const cookieToken = firebaseCookie
      ? decodeURIComponent(
          firebaseCookie.slice('firebase-token='.length),
        )
      : undefined

    const authorization = headers.get('authorization')
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined

    const idToken = bearerToken || cookieToken

    if (!idToken) return { user: null }

    try {
      const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken)

      if (!decoded.email || !decoded.email_verified || !isAllowedAdminEmail(decoded.email)) {
        return { user: null }
      }

      const result = await payload.find({
        collection: 'users',
        where: {
          email: { equals: decoded.email },
        },
        limit: 1,
        overrideAccess: true,
      })

      const user = result.docs[0]

      if (!user || user.role !== 'admin') {
        return { user: null }
      }

      return {
        user: {
          ...user,
          collection: 'users',
          _strategy: 'firebase',
        },
      }
    } catch (error) {
      console.error('Firebase authentication failed:', error)
      return { user: null }
    }
  },
}