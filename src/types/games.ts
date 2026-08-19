export interface GamesPlayerProfile {
  id: string
  name: string
  email: string
  icon: string
  color: string
}

export interface GamesPlayerRecord extends GamesPlayerProfile {
  solveCount: number
  totalMistakes: number
  solvedPuzzleIds: string[]
  updatedAt: number
}

export const GAMES_PLAYER_COLORS = [
  '#e8a900',
  '#6b9080',
  '#7b9acc',
  '#c77dff',
  '#e07a5f',
  '#2d6a4f',
  '#e63946',
  '#457b9d',
] as const

export const GAMES_PLAYER_ICONS = [
  '🎮',
  '🏆',
  '⭐',
  '🔥',
  '🚀',
  '🎯',
  '🦁',
  '🐻',
  '🦅',
  '🐺',
  '🎭',
  '🚌',
  '⚡',
  '🌟',
  '🎪',
  '🎨',
] as const

export type GamesLeaderboardTier = 'gold' | 'silver' | 'bronze' | 'default'

export type GamesLeaderboardSortKey = 'solved' | 'avgMistakes'

export function normalizeGamesEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidGamesEmail(email: string): boolean {
  const normalized = normalizeGamesEmail(email)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

export function getLeaderboardTier(rank: number): GamesLeaderboardTier {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'default'
}

export function getAverageMistakes(player: GamesPlayerRecord): number {
  if (player.solveCount <= 0) return 0
  return player.totalMistakes / player.solveCount
}

export function formatAverageMistakes(player: GamesPlayerRecord): string {
  if (player.solveCount <= 0) return '—'
  const average = getAverageMistakes(player)
  return Number.isInteger(average) ? String(average) : average.toFixed(1)
}

export function sortLeaderboardPlayers(
  players: GamesPlayerRecord[],
  sortBy: GamesLeaderboardSortKey,
): GamesPlayerRecord[] {
  return [...players].sort((a, b) => {
    if (sortBy === 'solved') {
      if (b.solveCount !== a.solveCount) return b.solveCount - a.solveCount
      const avgDiff = getAverageMistakes(a) - getAverageMistakes(b)
      if (avgDiff !== 0) return avgDiff
    } else {
      const avgDiff = getAverageMistakes(a) - getAverageMistakes(b)
      if (avgDiff !== 0) return avgDiff
      if (b.solveCount !== a.solveCount) return b.solveCount - a.solveCount
    }

    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt
    return a.name.localeCompare(b.name)
  })
}
