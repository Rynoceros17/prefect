import type { ProcessImageOptions } from './images'

const RETINA_CAP = 2.5

/** Long-lived cache for immutable UUID-based storage paths. */
export const IMAGE_CACHE_CONTROL = 'public,max-age=31536000,immutable'

function retinaPixels(cssPx: number): number {
  const dpr =
    typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio || 1, RETINA_CAP)
      : 2
  return Math.round(cssPx * dpr)
}

/** Small avatars and story rings — ~104px on screen. */
export function thumbUploadOptions(): ProcessImageOptions {
  const px = retinaPixels(120)
  return {
    maxWidth: px,
    maxHeight: px,
    quality: 0.85,
    maxBytes: 900_000,
  }
}

/** Gallery grid, journey pins, and general feed images. */
export function feedUploadOptions(): ProcessImageOptions {
  return {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.88,
    maxBytes: 2_000_000,
  }
}

/** Gallery lightbox — retina-sharp at max display size (~2× feed). */
export function fullUploadOptions(): ProcessImageOptions {
  return {
    maxWidth: 2400,
    maxHeight: 2400,
    quality: 0.92,
    maxBytes: 3_500_000,
  }
}

/** Team carousel hero — 16:9 frame at max content width. */
export function heroCarouselUploadOptions(): ProcessImageOptions {
  return {
    maxWidth: retinaPixels(1000),
    maxHeight: retinaPixels(562),
    quality: 0.92,
    maxBytes: 3_000_000,
  }
}

/** Leader modal hero photo. */
export function heroPortraitUploadOptions(): ProcessImageOptions {
  return {
    maxWidth: retinaPixels(480),
    maxHeight: retinaPixels(640),
    quality: 0.92,
    maxBytes: 2_500_000,
  }
}

/** Pick compression preset from a Firebase Storage path. */
export function uploadOptionsForPath(storagePath: string): ProcessImageOptions {
  if (storagePath.includes('-full')) return fullUploadOptions()
  if (storagePath.includes('/profile')) return thumbUploadOptions()
  if (storagePath.includes('/hero')) return heroPortraitUploadOptions()
  if (storagePath.includes('carousel')) return heroCarouselUploadOptions()
  if (storagePath.includes('posts/') || storagePath.includes('journey/')) return feedUploadOptions()
  return feedUploadOptions()
}

/** Warm the browser cache for carousel slides adjacent to the current one. */
export function preloadImageSources(sources: string[]): void {
  for (const src of sources) {
    if (!src || src.startsWith('data:')) continue
    const img = new Image()
    img.decoding = 'async'
    img.src = src
  }
}
