import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.appId,
  )
}

export const FIRESTORE_SITE_PATH = import.meta.env.VITE_FIRESTORE_SITE_PATH ?? 'site/main'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

function requireFirebase(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.')
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(requireFirebase())
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(requireFirebase())
  return storage
}
