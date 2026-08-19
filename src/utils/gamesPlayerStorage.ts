import type { GamesPlayerProfile } from '../types/games'
import { isValidGamesEmail, normalizeGamesEmail } from '../types/games'

const PLAYER_ID_KEY = 'prefect-games-player-id'
const PLAYER_PROFILE_KEY = 'prefect-games-player-profile'

function createPlayerId(): string {
  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getStoredPlayerId(): string | null {
  try {
    const id = localStorage.getItem(PLAYER_ID_KEY)
    return id?.trim() ? id : null
  } catch {
    return null
  }
}

export function ensureStoredPlayerId(): string {
  const existing = getStoredPlayerId()
  if (existing) return existing

  const id = createPlayerId()
  try {
    localStorage.setItem(PLAYER_ID_KEY, id)
  } catch {
    /* ignore quota errors */
  }
  return id
}

export function getStoredPlayerProfile(): GamesPlayerProfile | null {
  try {
    const raw = localStorage.getItem(PLAYER_PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GamesPlayerProfile>
    if (!parsed.id || !parsed.name || !parsed.icon || !parsed.color || !parsed.email) return null
    if (!isValidGamesEmail(parsed.email)) return null
    return {
      id: parsed.id,
      name: parsed.name,
      email: normalizeGamesEmail(parsed.email),
      icon: parsed.icon,
      color: parsed.color,
    }
  } catch {
    return null
  }
}

export function storePlayerProfile(profile: GamesPlayerProfile): void {
  try {
    localStorage.setItem(PLAYER_ID_KEY, profile.id)
    localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore quota errors */
  }
}

export function clearStoredPlayerProfile(): void {
  try {
    localStorage.removeItem(PLAYER_PROFILE_KEY)
  } catch {
    /* ignore quota errors */
  }
}
