import type { GalleryPost } from '../types'
import { DEFAULT_POST_ASPECT_RATIO, getAspectRatioWidthFactor } from './postImages'

/** Rough relative height used to pick the shortest masonry column. */
export function estimatePostHeight(post: GalleryPost): number {
  const aspectRatio = post.aspectRatio ?? DEFAULT_POST_ASPECT_RATIO
  const widthFactor = getAspectRatioWidthFactor(aspectRatio)
  const mediaHeight = widthFactor > 0 ? 1 / widthFactor : 1

  const captionLines = post.caption.trim() ? Math.min(3, Math.ceil(post.caption.length / 42)) : 0
  const captionHeight = captionLines * 0.08

  const headerHeight = 0.14
  const actionsHeight = 0.1
  const likesHeight = 0.07
  const editBoost = post.caption.length > 0 ? 0 : 0.02

  return mediaHeight + headerHeight + actionsHeight + likesHeight + captionHeight + editBoost
}

export function distributePostsToColumns(
  posts: GalleryPost[],
  columnCount: number,
): GalleryPost[][] {
  const columns: GalleryPost[][] = Array.from({ length: columnCount }, () => [])

  posts.forEach((post, index) => {
    columns[index % columnCount].push(post)
  })

  return columns
}

export function galleryColumnCount(viewportWidth: number): number {
  if (viewportWidth <= 640) return 1
  if (viewportWidth <= 1024) return 2
  return 3
}
