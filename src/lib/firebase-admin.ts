
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp()
  }

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

const app = createFirebaseAdminApp()

export const firebaseAdminAuth = getAuth(app)
