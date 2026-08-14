import type { ConnectionsPuzzle } from '../types/connections'

/** Example prefect-themed Connections puzzle — 16 words in a 4×4 grid. */
export const EXAMPLE_CONNECTIONS_PUZZLE: ConnectionsPuzzle = {
  id: 'prefect-001',
  number: 1,
  categories: [
    {
      title: 'School Houses',
      words: ['Raven', 'Falcon', 'Bear', 'Wolf'],
      difficulty: 0,
    },
    {
      title: 'Prefect Roles',
      words: ['Captain', 'Vice', 'Media', 'Sports'],
      difficulty: 1,
    },
    {
      title: 'Assembly Rituals',
      words: ['Roll', 'Notice', 'Anthem', 'Prayer'],
      difficulty: 2,
    },
    {
      title: '___ BELL',
      words: ['Liberty', 'Door', 'Taco', 'Wedding'],
      difficulty: 3,
    },
  ],
}

export const CONNECTIONS_PUZZLES = [EXAMPLE_CONNECTIONS_PUZZLE]

export function getConnectionsPuzzle(id?: string): ConnectionsPuzzle {
  return CONNECTIONS_PUZZLES.find((puzzle) => puzzle.id === id) ?? EXAMPLE_CONNECTIONS_PUZZLE
}
