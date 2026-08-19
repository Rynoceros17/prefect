import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { GamesPlayerProfile, GamesPlayerRecord } from '../types/games'
import { isValidGamesEmail, normalizeGamesEmail } from '../types/games'
import {
  registerGamesPlayer,
  recordGamesPuzzleSolve,
  subscribeGamesLeaderboard,
} from '../services/gamesLeaderboardService'
import { isFirebaseConfigured } from '../lib/firebase'
import {
  clearStoredPlayerProfile,
  ensureStoredPlayerId,
  getStoredPlayerProfile,
  storePlayerProfile,
} from '../utils/gamesPlayerStorage'

interface GamesPlayerContextValue {
  player: GamesPlayerProfile | null
  leaderboard: GamesPlayerRecord[]
  isSigningIn: boolean
  isLeaderboardLoading: boolean
  isFirebaseEnabled: boolean
  isProfileEditorOpen: boolean
  signIn: (profile: Omit<GamesPlayerProfile, 'id'>) => Promise<void>
  signOut: () => void
  openProfileEditor: () => void
  closeProfileEditor: () => void
  recordPuzzleSolve: (puzzleId: string, mistakes: number) => Promise<void>
}

const GamesPlayerContext = createContext<GamesPlayerContextValue | null>(null)

export function GamesPlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<GamesPlayerProfile | null>(() => getStoredPlayerProfile())
  const [leaderboard, setLeaderboard] = useState<GamesPlayerRecord[]>([])
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false)
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(isFirebaseConfigured())

  useEffect(() => {
    const unsubscribe = subscribeGamesLeaderboard(
      (players) => {
        setLeaderboard(players)
        setIsLeaderboardLoading(false)
      },
      () => {
        setIsLeaderboardLoading(false)
      },
    )
    return unsubscribe
  }, [])

  const signIn = useCallback(async (profile: Omit<GamesPlayerProfile, 'id'>) => {
    const id = player?.id ?? ensureStoredPlayerId()
    const next: GamesPlayerProfile = {
      id,
      name: profile.name.trim(),
      email: normalizeGamesEmail(profile.email),
      icon: profile.icon,
      color: profile.color,
    }

    if (!next.name || !isValidGamesEmail(next.email)) return

    setIsSigningIn(true)
    try {
      storePlayerProfile(next)
      setPlayer(next)
      if (isFirebaseConfigured()) {
        await registerGamesPlayer(next)
      }
    } finally {
      setIsSigningIn(false)
      setIsProfileEditorOpen(false)
    }
  }, [player?.id])

  const signOut = useCallback(() => {
    clearStoredPlayerProfile()
    setPlayer(null)
    setIsProfileEditorOpen(false)
  }, [])

  const openProfileEditor = useCallback(() => {
    setIsProfileEditorOpen(true)
  }, [])

  const closeProfileEditor = useCallback(() => {
    setIsProfileEditorOpen(false)
  }, [])

  const recordPuzzleSolve = useCallback(
    async (puzzleId: string, mistakes: number) => {
      if (!player || !puzzleId) return
      try {
        await recordGamesPuzzleSolve(player, puzzleId, mistakes)
      } catch {
        /* ignore sync errors */
      }
    },
    [player],
  )

  const value = useMemo(
    () => ({
      player,
      leaderboard,
      isSigningIn,
      isLeaderboardLoading,
      isFirebaseEnabled: isFirebaseConfigured(),
      isProfileEditorOpen,
      signIn,
      signOut,
      openProfileEditor,
      closeProfileEditor,
      recordPuzzleSolve,
    }),
    [
      player,
      leaderboard,
      isSigningIn,
      isLeaderboardLoading,
      isProfileEditorOpen,
      signIn,
      signOut,
      openProfileEditor,
      closeProfileEditor,
      recordPuzzleSolve,
    ],
  )

  return <GamesPlayerContext.Provider value={value}>{children}</GamesPlayerContext.Provider>
}

export function useGamesPlayer() {
  const ctx = useContext(GamesPlayerContext)
  if (!ctx) throw new Error('useGamesPlayer must be used within GamesPlayerProvider')
  return ctx
}
