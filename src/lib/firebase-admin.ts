
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp()
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is missing from the environment.',
    )
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson)

    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    })
  } catch (error) {
    console.error('Firebase service-account configuration is invalid.')
    throw error
  }
}

let auth: Auth | undefined

// Initialised on first use, not at import: payload.config imports this via the
// auth strategy, so an import-time throw breaks every route during `next build`.
export function getFirebaseAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(createFirebaseAdminApp())
  }
  return auth
}
