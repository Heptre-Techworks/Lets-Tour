
'use client'

import React, { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { getFirebaseAuth, googleProvider } from '@/lib/firebase'

export default function BeforeLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await signInWithPopup(getFirebaseAuth(), googleProvider)
      const idToken = await result.user.getIdToken()

      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        // Don't keep a rejected Google account signed in to Firebase in this browser.
        await signOut(getFirebaseAuth()).catch(() => {})
        const body = await response.json().catch(() => null)
        throw new Error(
          (body && typeof body.error === 'string' && body.error) ||
            'Google login could not be completed. Contact your administrator.',
        )
      }

      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <button type="button" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
