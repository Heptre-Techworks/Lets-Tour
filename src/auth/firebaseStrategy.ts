import type { AuthStrategy } from 'payload'
import { firebaseAdminAuth } from '@/lib/firebase-admin'

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
      const decoded = await firebaseAdminAuth.verifyIdToken(idToken)

      if (!decoded.email || !decoded.email_verified) {
        return { user: null }
      }
      const allowedEmails = [
  'bgragavendiran@gmail.com',
  'a.mukesh2006@gmail.com',
]

if (!allowedEmails.includes(decoded.email.toLowerCase())) {
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