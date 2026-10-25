
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { firebaseAdminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const idToken = body?.idToken

    if (typeof idToken !== 'string' || !idToken) {
      return NextResponse.json(
        { error: 'Missing ID token' },
        { status: 400 },
      )
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(idToken)

    if (!decoded.email || !decoded.email_verified) {
      return NextResponse.json(
        { error: 'Google email is not verified' },
        { status: 401 },
      )
    }

    const payload = await getPayload({ config })

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
      return NextResponse.json(
        { error: 'No authorized Payload admin account exists for this Google email' },
        { status: 403 },
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set({
      name: 'firebase-token',
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Firebase admin login failed:', error)

    return NextResponse.json(
      { error: 'Google sign-in could not be completed' },
      { status: 401 },
    )
  }
}
