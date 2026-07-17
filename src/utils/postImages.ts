import type { PostAspectRatio, PostImageMeta } from '../types'
import { normalizePanValue } from './cropBounds'

export const DEFAULT_POST_ASPECT_RATIO: PostAspectRatio = '2/1'

export const ASPECT_RATIO_OPTIONS: { value: PostAspectRatio; label: string }[] = [
  { value: '2/1', label: 'Wide (2:1)' },
  { value: '1', label: 'Square (1:1)' },
  { value: '4/5', label: 'Portrait (4:5)' },
  { value: '3/4', label: 'Portrait (3:4)' },
  { value: '16/9', label: 'Landscape (16:9)' },
]

export const DEFAULT_IMAGE_META: PostImageMeta = { panX: 0, panY: 0, zoom: 1 }

/** Width-to-height ratio for viewport-fit sizing (e.g. 2/1 → 2). */
export function getAspectRatioWidthFactor(aspectRatio: PostAspectRatio): number {
  if (aspectRatio === '1') return 1
  const [w, h] = aspectRatio.split('/').map(Number)
  return w / h
}

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
