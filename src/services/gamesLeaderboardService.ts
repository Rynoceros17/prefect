import {
  doc,
  onSnapshot,
  runTransaction,
  type Unsubscribe,
} from 'firebase/firestore'
import type { GamesPlayerProfile, GamesPlayerRecord } from '../types/games'
import { isValidGamesEmail, normalizeGamesEmail } from '../types/games'
import { getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import { sanitizeForFirestore } from '../utils/firestoreSanitize'

const FIRESTORE_GAMES_LEADERBOARD_PATH =
  import.meta.env.VITE_FIRESTORE_GAMES_LEADERBOARD_PATH ?? 'site/gamesLeaderboard'

interface GamesLeaderboardDocument {
  players?: Record<string, GamesPlayerRecord>
}

function leaderboardDocRef() {
  const [collectionId, documentId] = FIRESTORE_GAMES_LEADERBOARD_PATH.split('/')
  if (!collectionId || !documentId) {
    throw new Error(`Invalid games leaderboard path: ${FIRESTORE_GAMES_LEADERBOARD_PATH}`)
  }
  return doc(getFirebaseDb(), collectionId, documentId)
}

function normalizePlayer(raw: Partial<GamesPlayerRecord> | undefined, id: string): GamesPlayerRecord | null {
  if (!raw?.name?.trim() || !raw.icon || !raw.color) return null
  const email = raw.email ? normalizeGamesEmail(raw.email) : ''
  return {
    id,
    name: raw.name,
    email: isValidGamesEmail(email) ? email : '',
    icon: raw.icon,
    color: raw.color,
    solveCount: Math.max(0, raw.solveCount ?? 0),
    totalMistakes: Math.max(0, raw.totalMistakes ?? 0),
    solvedPuzzleIds: Array.isArray(raw.solvedPuzzleIds) ? raw.solvedPuzzleIds : [],
    updatedAt: raw.updatedAt ?? 0,
  }
}

export function subscribeGamesLeaderboard(
  onData: (players: GamesPlayerRecord[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    onData([])
    return () => {}
  }

  return onSnapshot(
    leaderboardDocRef(),
    (snapshot) => {
      const payload = (snapshot.data() as GamesLeaderboardDocument | undefined) ?? {}
      const players = Object.entries(payload.players ?? {})
        .map(([id, player]) => normalizePlayer(player, id))
        .filter((player): player is GamesPlayerRecord => player !== null)
      onData(players)
    },
    (error) => {
      onError(error.message || 'Could not load games leaderboard.')
    },
  )
}

export async function registerGamesPlayer(profile: GamesPlayerProfile): Promise<GamesPlayerRecord> {
  if (!isFirebaseConfigured()) {
    throw new Error('Leaderboard sync requires Firebase.')
  }

  const ref = leaderboardDocRef()
  const db = getFirebaseDb()
  const now = Date.now()

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const payload = (snapshot.data() as GamesLeaderboardDocument | undefined) ?? {}
    const existing = normalizePlayer(payload.players?.[profile.id], profile.id)

    const next: GamesPlayerRecord = {
      id: profile.id,
      name: profile.name.trim(),
      email: normalizeGamesEmail(profile.email),
      icon: profile.icon,
      color: profile.color,
      solveCount: existing?.solveCount ?? 0,
      totalMistakes: existing?.totalMistakes ?? 0,
      solvedPuzzleIds: existing?.solvedPuzzleIds ?? [],
      updatedAt: now,
    }

    transaction.set(
      ref,
      sanitizeForFirestore({
        players: {
          ...(payload.players ?? {}),
          [profile.id]: next,
        },
      }),
      { merge: true },
    )

    return next
  })
}

export async function recordGamesPuzzleSolve(
  profile: GamesPlayerProfile,
  puzzleId: string,
  mistakes: number,
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false

  const ref = leaderboardDocRef()
  const db = getFirebaseDb()
  const now = Date.now()

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const payload = (snapshot.data() as GamesLeaderboardDocument | undefined) ?? {}
    const existing =
      normalizePlayer(payload.players?.[profile.id], profile.id) ??
      ({
        id: profile.id,
        name: profile.name.trim(),
        email: normalizeGamesEmail(profile.email),
        icon: profile.icon,
        color: profile.color,
        solveCount: 0,
        totalMistakes: 0,
        solvedPuzzleIds: [],
        updatedAt: 0,
      } satisfies GamesPlayerRecord)

    if (existing.solvedPuzzleIds.includes(puzzleId)) {
      return false
    }

    const next: GamesPlayerRecord = {
      ...existing,
      name: profile.name.trim(),
      email: normalizeGamesEmail(profile.email),
      icon: profile.icon,
      color: profile.color,
      solveCount: existing.solveCount + 1,
      totalMistakes: existing.totalMistakes + Math.max(0, mistakes),
      solvedPuzzleIds: [...existing.solvedPuzzleIds, puzzleId],
      updatedAt: now,
    }

    transaction.set(
      ref,
      sanitizeForFirestore({
        players: {
          ...(payload.players ?? {}),
          [profile.id]: next,
        },
      }),
      { merge: true },
    )

    return true
  })
}
