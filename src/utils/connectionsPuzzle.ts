import type {
  ConnectionsCategory,
  ConnectionsDifficulty,
  ConnectionsPuzzle,
} from '../types/connections'
import { EXAMPLE_CONNECTIONS_PUZZLE } from '../data/connectionsPuzzles'

const DIFFICULTIES: ConnectionsDifficulty[] = [0, 1, 2, 3]

function trimWord(word: string): string {
  return word.trim()
}

function normalizeWords(words: string[]): [string, string, string, string] {
  const padded = [...words.map(trimWord), '', '', '', ''].slice(0, 4)
  return [padded[0], padded[1], padded[2], padded[3]]
}

function normalizeCategory(
  category: Partial<ConnectionsCategory>,
  index: number,
): ConnectionsCategory {
  const words = normalizeWords(Array.isArray(category.words) ? category.words : [])
  const difficulty =
    typeof category.difficulty === 'number' && category.difficulty >= 0 && category.difficulty <= 3
      ? (category.difficulty as ConnectionsDifficulty)
      : DIFFICULTIES[index] ?? 0

  return {
    title: trimWord(category.title ?? '') || `Category ${index + 1}`,
    words,
    difficulty,
  }
}

export function normalizeConnectionsPuzzle(
  puzzle?: Partial<ConnectionsPuzzle> | null,
): ConnectionsPuzzle {
  const fallback = EXAMPLE_CONNECTIONS_PUZZLE
  const categories = (puzzle?.categories ?? fallback.categories).slice(0, 4)
  while (categories.length < 4) {
    categories.push({
      title: `Category ${categories.length + 1}`,
      words: ['', '', '', ''],
      difficulty: DIFFICULTIES[categories.length] ?? 0,
    })
  }

  return {
    id: puzzle?.id?.trim() || fallback.id,
    number: Math.max(1, Math.floor(puzzle?.number ?? fallback.number)),
    categories: categories.map((category, index) => normalizeCategory(category, index)),
  }
}

export interface ConnectionsPuzzleValidation {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export function validateConnectionsPuzzle(puzzle: ConnectionsPuzzle): ConnectionsPuzzleValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const seen = new Map<string, string>()

  if (puzzle.categories.length !== 4) {
    errors.push('A puzzle needs exactly 4 groups.')
  }

  puzzle.categories.forEach((category, index) => {
    if (!trimWord(category.title)) {
      errors.push(`Group ${index + 1} needs a name.`)
    }

    category.words.forEach((word, wordIndex) => {
      const trimmed = trimWord(word)
      if (!trimmed) {
        errors.push(`Group ${index + 1}, word ${wordIndex + 1} is empty.`)
        return
      }

      const key = trimmed.toLowerCase()
      const previous = seen.get(key)
      if (previous) {
        errors.push(`"${trimmed}" appears more than once (${previous} and ${category.title}).`)
      } else {
        seen.set(key, category.title || `Group ${index + 1}`)
      }
    })
  })

  const filledWords = puzzle.categories.flatMap((category) =>
    category.words.map(trimWord).filter(Boolean),
  )
  if (filledWords.length !== 16 && errors.length === 0) {
    warnings.push(`You have ${filledWords.length} of 16 words filled in.`)
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function updateConnectionsCategory(
  puzzle: ConnectionsPuzzle,
  categoryIndex: number,
  patch: Partial<ConnectionsCategory>,
): ConnectionsPuzzle {
  return {
    ...puzzle,
    categories: puzzle.categories.map((category, index) =>
      index === categoryIndex
        ? {
            ...category,
            ...patch,
            words: patch.words ? normalizeWords(patch.words) : category.words,
          }
        : category,
    ),
  }
}

export function updateConnectionsWord(
  puzzle: ConnectionsPuzzle,
  categoryIndex: number,
  wordIndex: number,
  value: string,
): ConnectionsPuzzle {
  const words = [...puzzle.categories[categoryIndex].words] as string[]
  words[wordIndex] = value
  return updateConnectionsCategory(puzzle, categoryIndex, { words: normalizeWords(words) })
}
