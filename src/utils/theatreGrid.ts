import type { GridVideoItem } from '../types'

export const THEATRE_GRID_SIZE = 9

export function normalizeTheatreGridVideos(items?: GridVideoItem[]): GridVideoItem[] {
  const source = items ?? []

  return Array.from({ length: THEATRE_GRID_SIZE }, (_, index) => {
    const existing = source[index]
    if (existing) {
      return {
        id: existing.id || `grid-video-${index + 1}`,
        title: existing.title ?? '',
        youtubeUrl: existing.youtubeUrl ?? '',
      }
    }

    return {
      id: `grid-video-${index + 1}`,
      title: '',
      youtubeUrl: '',
    }
  })
}
