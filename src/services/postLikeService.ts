import type { SiteData } from '../types'

const LIKED_POSTS_KEY = 'leadership-gallery-liked-posts'

function readLikedPostIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_POSTS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writeLikedPostIds(ids: Set<string>): void {
  try {
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore quota errors */
  }
}

export function isPostLiked(postId: string): boolean {
  return readLikedPostIds().has(postId)
}

export function setPostLiked(postId: string, liked: boolean): void {
  const ids = readLikedPostIds()
  if (liked) ids.add(postId)
  else ids.delete(postId)
  writeLikedPostIds(ids)
}

/** Merge per-browser liked state into posts loaded from Firestore. */
export function applyLocalLikeState(data: SiteData): SiteData {
  const likedIds = readLikedPostIds()
  return {
    ...data,
    posts: data.posts.map((post) => ({
      ...post,
      likes: Math.max(0, post.likes ?? 0),
      liked: likedIds.has(post.id),
    })),
  }
}
