import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { DEFAULT_SITE_DATA } from '../data/defaults'
import type { SiteData } from '../types'
import { migrateSiteData } from '../utils/migrateSiteData'
import { deleteStorageImages } from '../services/imageUpload'
import { collectSiteImageUrls, findOrphanedImageUrls } from '../utils/siteImageUrls'
import { uploadEmbeddedImages } from '../utils/siteDataImages'
import { normalizeVideoRelease } from '../utils/videoRelease'
import { FIRESTORE_SITE_PATH, getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'

interface SiteDocument {
  content: SiteData
  updatedAt?: { toMillis: () => number }
}

function normalizeSiteData(raw: Partial<SiteData>): SiteData {
  const migrated = migrateSiteData(raw)
  const videos = (migrated.videos ?? DEFAULT_SITE_DATA.videos).map(normalizeVideoRelease)
  return { ...migrated, videos }
}

function siteDocRef() {
  const [collectionId, documentId] = FIRESTORE_SITE_PATH.split('/')
  if (!collectionId || !documentId) {
    throw new Error(`Invalid VITE_FIRESTORE_SITE_PATH: ${FIRESTORE_SITE_PATH}`)
  }
  return doc(getFirebaseDb(), collectionId, documentId)
}

export async function fetchSiteData(): Promise<SiteData | null> {
  if (!isFirebaseConfigured()) return null

  const snapshot = await getDoc(siteDocRef())
  if (!snapshot.exists()) return null

  const payload = snapshot.data() as SiteDocument
  if (!payload.content) return null
  return normalizeSiteData(payload.content)
}

export function subscribeSiteData(
  onData: (data: SiteData, updatedAtMs: number) => void,
  onError: (message: string) => void,
): Unsubscribe {
  if (!isFirebaseConfigured()) return () => {}

  return onSnapshot(
    siteDocRef(),
    (snapshot) => {
      if (!snapshot.exists()) return
      const payload = snapshot.data() as SiteDocument
      if (!payload.content) return
      const updatedAtMs = payload.updatedAt?.toMillis?.() ?? 0
      onData(normalizeSiteData(payload.content), updatedAtMs)
    },
    (error) => {
      onError(error.message || 'Could not load site data from Firebase.')
    },
  )
}

export async function saveSiteData(data: SiteData): Promise<{ updatedAtMs: number; content: SiteData }> {
  if (!isFirebaseConfigured()) return { updatedAtMs: 0, content: data }

  const previous = await fetchSiteData()
  const content = await uploadEmbeddedImages(data)
  const updatedAtMs = Date.now()

  await setDoc(
    siteDocRef(),
    {
      content,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  if (previous) {
    const orphaned = findOrphanedImageUrls(
      collectSiteImageUrls(previous),
      collectSiteImageUrls(content),
    )
    if (orphaned.length > 0) {
      await deleteStorageImages(orphaned)
    }
  }

  return { updatedAtMs, content }
}
