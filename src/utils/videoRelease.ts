import type { VideoItem } from '../types'

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseReleaseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getVideoReleaseDate(video: VideoItem): Date {
  if (video.releaseDate) {
    return parseReleaseDate(video.releaseDate)
  }

  const days = video.releaseDays ?? 0
  const date = new Date()
  date.setDate(date.getDate() + days)
  return startOfDay(date)
}

export function normalizeVideoRelease(video: VideoItem): VideoItem {
  if (video.releaseDate) {
    return video
  }

  const date = getVideoReleaseDate(video)
  const { releaseDays: _releaseDays, ...rest } = video
  return { ...rest, releaseDate: toISODate(date) }
}

export function isVideoLocked(video: VideoItem, now = new Date()): boolean {
  return getVideoReleaseDate(video) > startOfDay(now)
}

export function formatReleaseLabel(video: VideoItem): string {
  const releaseDate = getVideoReleaseDate(video)

  if (!isVideoLocked(video)) {
    return 'Available now'
  }

  const formatted = releaseDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `Releases on ${formatted}`
}
