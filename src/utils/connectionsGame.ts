import type {
  ConnectionsCategory,
  ConnectionsDifficulty,
  ConnectionsGameState,
  ConnectionsPuzzle,
  ConnectionsSolvedGroup,
  ConnectionsToggleResult,
} from '../types/connections'

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function getAllPuzzleWords(puzzle: ConnectionsPuzzle): string[] {
  return puzzle.categories.flatMap((category) => category.words)
}

export function createConnectionsGameState(puzzle: ConnectionsPuzzle): ConnectionsGameState {
  return {
    remaining: shuffleArray(getAllPuzzleWords(puzzle)),
    solved: [],
    selected: [],
    mistakes: 0,
    status: 'playing',
    wrongGuessKeys: new Set(),
    message: null,
    shaking: false,
    revealedRemaining: false,
  }
}

export function guessKey(words: string[]): string {
  return [...words].sort().join('|')
}

export function findMatchingCategory(
  words: string[],
  puzzle: ConnectionsPuzzle,
  solved: ConnectionsSolvedGroup[],
): ConnectionsCategory | null {
  const solvedTitles = new Set(solved.map((group) => group.category.title))
  const match = puzzle.categories.find((category) => {
    if (solvedTitles.has(category.title)) return false
    return words.every((word) => category.words.includes(word as (typeof category.words)[number]))
  })
  return match ?? null
}

export function maxWordsSharingCategory(words: string[], puzzle: ConnectionsPuzzle): number {
  let max = 0
  for (const category of puzzle.categories) {
    const count = words.filter((word) => category.words.includes(word as (typeof category.words)[number])).length
    max = Math.max(max, count)
  }
  return max
}

export function isOneAway(words: string[], puzzle: ConnectionsPuzzle): boolean {
  return words.length === 4 && maxWordsSharingCategory(words, puzzle) === 3
}

export function toggleWordSelection(
  state: ConnectionsGameState,
  word: string,
): { next: ConnectionsGameState; result: ConnectionsToggleResult } {
  if (state.status !== 'playing') {
    return { next: state, result: 'ignored' }
  }

  if (state.selected.includes(word)) {
    return {
      next: {
        ...state,
        selected: state.selected.filter((item) => item !== word),
        message: null,
        shaking: false,
      },
      result: 'deselected',
    }
  }

  if (state.selected.length >= 4) {
    return { next: state, result: 'rejected' }
  }

  return {
    next: {
      ...state,
      selected: [...state.selected, word],
      message: null,
      shaking: false,
    },
    result: 'selected',
  }
}

export function deselectAll(state: ConnectionsGameState): ConnectionsGameState {
  if (state.status !== 'playing') return state
  return { ...state, selected: [], message: null }
}

export function shuffleRemaining(state: ConnectionsGameState): ConnectionsGameState {
  if (state.status !== 'playing' || state.remaining.length <= 1) return state
  return {
    ...state,
    remaining: shuffleArray(state.remaining),
    selected: [],
    message: null,
  }
}

function withSolvedGroup(
  state: ConnectionsGameState,
  category: ConnectionsCategory,
  words: string[],
): ConnectionsGameState {
  const remaining = state.remaining.filter((word) => !words.includes(word))
  const solved = [...state.solved, { category, words }]
  const won = remaining.length === 0

  return {
    ...state,
    remaining,
    solved,
    selected: [],
    message: won ? 'Perfect!' : null,
    status: won ? 'won' : state.status,
    shaking: false,
  }
}

function withWrongGuess(
  state: ConnectionsGameState,
  key: string,
  puzzle: ConnectionsPuzzle,
  words: string[],
  alreadyGuessed: boolean,
): ConnectionsGameState {
  const mistakes = alreadyGuessed ? state.mistakes : state.mistakes + 1
  const wrongGuessKeys = new Set(state.wrongGuessKeys)
  wrongGuessKeys.add(key)

  let message = 'Try again.'
  if (isOneAway(words, puzzle)) message = 'One away…'
  if (alreadyGuessed) message = 'Already guessed!'

  return {
    ...state,
    mistakes,
    selected: [],
    message,
    shaking: !alreadyGuessed,
    wrongGuessKeys,
  }
}

export function applySolvedGroup(
  state: ConnectionsGameState,
  category: ConnectionsCategory,
  words: string[],
): ConnectionsGameState {
  return withSolvedGroup(state, category, words)
}

export function previewSubmitSelection(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle,
):
  | { kind: 'correct'; category: ConnectionsCategory; words: string[] }
  | { kind: 'wrong'; next: ConnectionsGameState }
  | { kind: 'invalid' } {
  if (state.status !== 'playing' || state.selected.length !== 4) {
    return { kind: 'invalid' }
  }

  const words = [...state.selected]
  const key = guessKey(words)
  const alreadyGuessed = state.wrongGuessKeys.has(key)
  const category = findMatchingCategory(words, puzzle, state.solved)

  if (category) {
    return { kind: 'correct', category, words }
  }

  return {
    kind: 'wrong',
    next: withWrongGuess(state, key, puzzle, words, alreadyGuessed),
  }
}

export function submitSelection(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle,
): ConnectionsGameState {
  if (state.status !== 'playing' || state.selected.length !== 4) return state

  const words = [...state.selected]
  const key = guessKey(words)
  const alreadyGuessed = state.wrongGuessKeys.has(key)
  const category = findMatchingCategory(words, puzzle, state.solved)

  if (category) {
    return withSolvedGroup(state, category, words)
  }

  return withWrongGuess(state, key, puzzle, words, alreadyGuessed)
}

export function revealRemainingGroups(
  state: ConnectionsGameState,
  puzzle: ConnectionsPuzzle,
): ConnectionsGameState {
  if (state.revealedRemaining) return state

  const solvedTitles = new Set(state.solved.map((group) => group.category.title))
  const unsolved = puzzle.categories
    .filter((category) => !solvedTitles.has(category.title))
    .sort((a, b) => a.difficulty - b.difficulty)
    .map((category) => ({
      category,
      words: [...category.words],
    }))

  return {
    ...state,
    solved: [...state.solved, ...unsolved],
    remaining: [],
    revealedRemaining: true,
    selected: [],
    message: null,
  }
}

export function getDifficultyEmoji(difficulty: ConnectionsDifficulty): string {
  return difficulty === 0 ? '🟨' : difficulty === 1 ? '🟩' : difficulty === 2 ? '🟦' : '🟪'
}

export function buildConnectionsEmojiLines(state: ConnectionsGameState): string[] {
  return state.solved.map((group) => getDifficultyEmoji(group.category.difficulty).repeat(4))
}

export function buildConnectionsEmojiResult(state: ConnectionsGameState): string {
  return buildConnectionsEmojiLines(state).join('\n')
}

export function buildShareText(puzzle: ConnectionsPuzzle, state: ConnectionsGameState): string {
  const emojiGrid = buildConnectionsEmojiResult(state)
  const mistakeLabel = `${state.mistakes} mistake${state.mistakes === 1 ? '' : 's'}`
  return [`Prefect Connections #${puzzle.number}`, emojiGrid, mistakeLabel].filter(Boolean).join('\n')
}
