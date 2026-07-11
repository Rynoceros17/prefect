import type { PostAspectRatio, PostImageMeta } from '../types'
import { normalizePanValue } from './cropBounds'

export const ASPECT_RATIO_OPTIONS: { value: PostAspectRatio; label: string }[] = [
  { value: '1', label: 'Square (1:1)' },
  { value: '4/5', label: 'Portrait (4:5)' },
  { value: '3/4', label: 'Portrait (3:4)' },
  { value: '16/9', label: 'Landscape (16:9)' },
]

export const DEFAULT_IMAGE_META: PostImageMeta = { panX: 0, panY: 0, zoom: 1 }

export function normalizeImageMeta(
  images: string[],
  meta?: PostImageMeta[],
): PostImageMeta[] {
  return images.map((_, i) => ({
    panX: normalizePanValue(meta?.[i]?.panX),
    panY: normalizePanValue(meta?.[i]?.panY),
    zoom: Math.max(1, meta?.[i]?.zoom ?? 1),
  }))
}

export function reorderImages<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
