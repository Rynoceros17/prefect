import {
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { FIRESTORE_STATS_PATH, getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'

const LOCAL_VIEWS_KEY = 'leadership-gallery-page-views'

interface StatsDocument {
  totalPageViews?: number
}

function statsDocRef() {
  const [collectionId, documentId] = FIRESTORE_STATS_PATH.split('/')
  if (!collectionId || !documentId) {
    throw new Error(`Invalid VITE_FIRESTORE_STATS_PATH: ${FIRESTORE_STATS_PATH}`)
  }
  return doc(getFirebaseDb(), collectionId, documentId)
}

function readLocalPageViews(): number {
  try {
    const raw = localStorage.getItem(LOCAL_VIEWS_KEY)
    if (!raw) return 0
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  } catch {
    return 0
  }
}

function writeLocalPageViews(count: number): void {
  try {
    localStorage.setItem(LOCAL_VIEWS_KEY, String(count))
  } catch {
    /* ignore quota errors */
  }
}

let lastRecordedKey = ''
let lastRecordedAt = 0

/** Count each route open once; dedupe React StrictMode double-mounts. */
export async function recordPageViewOnce(pathname: string, search: string): Promise<void> {
  const key = `${pathname}${search}`
  const now = Date.now()
  if (key === lastRecordedKey && now - lastRecordedAt < 2000) return

  lastRecordedKey = key
  lastRecordedAt = now

  if (!isFirebaseConfigured()) {
    writeLocalPageViews(readLocalPageViews() + 1)
    return
  }

  const ref = statsDocRef()
  try {
    await updateDoc(ref, { totalPageViews: increment(1) })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code !== 'not-found') throw err
    await setDoc(ref, { totalPageViews: 1 }, { merge: true })
  }
}

export function getPageViewCount(): number {
  return readLocalPageViews()
}

export function subscribePageViewCount(
  onCount: (count: number) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    onCount(readLocalPageViews())
    return () => {}
  }

  return onSnapshot(
    statsDocRef(),
    (snapshot) => {
      const data = snapshot.data() as StatsDocument | undefined
      onCount(Math.max(0, data?.totalPageViews ?? 0))
    },
    (error) => {
      onError?.(error.message || 'Could not load page views.')
    },
  )
}

export function formatViewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return '0'
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (count >= 10_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return count.toLocaleString()
}
