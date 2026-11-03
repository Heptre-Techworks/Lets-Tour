import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

// NEXT_PUBLIC_* values are inlined at build time, so they must be set in the
// environment that runs `next build` (e.g. Vercel project env vars).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let auth: Auth | undefined

// Initialised on first use, not at import: this module is pulled into the admin
// login view, which is server-rendered, and getAuth() throws
// auth/invalid-api-key when the config is missing, failing the whole /admin render.
export function getFirebaseAuth(): Auth {
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Google sign-in is not configured (NEXT_PUBLIC_FIREBASE_API_KEY is missing).',
    )
  }
  if (!auth) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
  }
  return auth
}

export const googleProvider = new GoogleAuthProvider()
// Always show the account picker, so someone rejected with one account can pick another.
googleProvider.setCustomParameters({ prompt: 'select_account' })
