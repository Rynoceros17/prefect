export type ConnectionsDifficulty = 0 | 1 | 2 | 3

export interface ConnectionsCategory {
  title: string
  words: [string, string, string, string]
  difficulty: ConnectionsDifficulty
}

export interface ConnectionsPuzzle {
  id: string
  number: number
  categories: ConnectionsCategory[]
}

export type ConnectionsGameStatus = 'playing' | 'won' | 'lost'

export interface ConnectionsSolvedGroup {
  category: ConnectionsCategory
  words: string[]
}

export interface ConnectionsGameState {
  remaining: string[]
  solved: ConnectionsSolvedGroup[]
  selected: string[]
  mistakes: number
  status: ConnectionsGameStatus
  wrongGuessKeys: Set<string>
  message: string | null
  shaking: boolean
  revealedRemaining: boolean
}

export type ConnectionsToggleResult = 'selected' | 'deselected' | 'rejected' | 'ignored'

export const CONNECTIONS_DIFFICULTY_COLORS: Record<ConnectionsDifficulty, string> = {
  0: '#f9df6d',
  1: '#a0c35a',
  2: '#b0c4ef',
  3: '#ba81c5',
}

export const CONNECTIONS_DIFFICULTY_LABELS: Record<ConnectionsDifficulty, string> = {
  0: 'Straightforward',
  1: 'Easy',
  2: 'Medium',
  3: 'Tricky',
}
