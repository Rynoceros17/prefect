import type {
  ConnectionsCategory,
  ConnectionsDifficulty,
  ConnectionsPuzzle,
} from '../types/connections'
import { EXAMPLE_CONNECTIONS_PUZZLE } from '../data/connectionsPuzzles'

const DIFFICULTIES: ConnectionsDifficulty[] = [0, 1, 2, 3]

function normalizeWords(words: string[]): [string, string, string, string] {
  const padded = [...words, '', '', '', ''].slice(0, 4)
  return [padded[0], padded[1], padded[2], padded[3]]
}

function normalizeCategory(
  category: Partial<ConnectionsCategory>,
  index: number,
): ConnectionsCategory {
  const words = normalizeWords(Array.isArray(category.words) ? category.words : [])

  return {
    title: category.title ?? `Category ${index + 1}`,
    words,
    difficulty: DIFFICULTIES[index] ?? 0,
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
    if (!category.title.trim()) {
      errors.push(`Group ${index + 1} needs a name.`)
    }

    category.words.forEach((word, wordIndex) => {
      if (!word.trim()) {
        errors.push(`Group ${index + 1}, word ${wordIndex + 1} is empty.`)
        return
      }

      const key = word.trim().toLowerCase()
      const previous = seen.get(key)
      if (previous) {
        errors.push(`"${word.trim()}" appears more than once (${previous} and ${category.title}).`)
      } else {
        seen.set(key, category.title || `Group ${index + 1}`)
      }
    })
  })

  const filledWords = puzzle.categories.flatMap((category) =>
    category.words.filter((word) => word.trim()),
  )
  if (filledWords.length !== 16 && errors.length === 0) {
    warnings.push(`You have ${filledWords.length} of 16 words filled in.`)
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function updateConnectionsCategory(
  puzzle: ConnectionsPuzzle,
  categoryIndex: number,
  patch: Partial<Omit<ConnectionsCategory, 'difficulty'>>,
): ConnectionsPuzzle {
  return {
    ...puzzle,
    categories: puzzle.categories.map((category, index) =>
      index === categoryIndex
        ? {
            ...category,
            ...patch,
            difficulty: DIFFICULTIES[index] ?? 0,
            words: patch.words ? normalizeWords(patch.words) : category.words,
          }
        : { ...category, difficulty: DIFFICULTIES[index] ?? 0 },
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
