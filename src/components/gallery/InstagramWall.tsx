import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEditMode } from '../../context/EditModeContext'
import { useSiteDataContext } from '../../context/SiteDataContext'
import type { GalleryPost } from '../../types'
import { collectHashtags, postMatchesHashtag } from '../../utils/hashtags'
import { ProfileAvatar } from './ProfileAvatar'
import { PostCard } from './PostCard'

function sortPosts(posts: GalleryPost[]): GalleryPost[] {
  return [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function InstagramWall() {
  const { data, updateData } = useSiteDataContext()
  const { isEditMode } = useEditMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null)
  const [landingPostId, setLandingPostId] = useState<string | null>(null)
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  const highlightedPostId = searchParams.get('post')
  const animatingPostId = landingPostId ?? highlightedPostId

  const allHashtags = useMemo(
    () => collectHashtags(data.posts.map((p) => p.caption)),
    [data.posts],
  )

  const visiblePosts = useMemo(() => {
    const filtered = data.posts.filter((p) =>
      postMatchesHashtag(p.caption, activeHashtag),
    )
    return sortPosts(filtered)
  }, [data.posts, activeHashtag])

  const setPostRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) postRefs.current.set(id, el)
      else postRefs.current.delete(id)
    },
    [],
  )

  const scrollToPost = useCallback((postId: string) => {
    const timer = window.setTimeout(() => {
      const el = postRefs.current.get(postId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [])

  const navigateToPost = useCallback(
    (postId: string) => {
      const post = data.posts.find((p) => p.id === postId)
      if (!post) return

      if (activeHashtag && !postMatchesHashtag(post.caption, activeHashtag)) {
        setActiveHashtag(null)
      }

      setLandingPostId(postId)
      setSearchParams({ post: postId }, { replace: true })
    },
    [activeHashtag, data.posts, setSearchParams],
  )

  useEffect(() => {
    if (!animatingPostId) return

    const scrollCleanup = scrollToPost(animatingPostId)
    const animCleanup = window.setTimeout(() => {
      setLandingPostId(null)
    }, 1800)

    return () => {
      scrollCleanup()
      window.clearTimeout(animCleanup)
    }
  }, [animatingPostId, visiblePosts, scrollToPost])

  useEffect(() => {
    if (highlightedPostId && !landingPostId) {
      const post = data.posts.find((p) => p.id === highlightedPostId)
      if (post && activeHashtag && !postMatchesHashtag(post.caption, activeHashtag)) {
        setActiveHashtag(null)
      }
    }
  }, [highlightedPostId, landingPostId, data.posts, activeHashtag])

  const addPost = () => {
    const newPost: GalleryPost = {
      id: `post-${Date.now()}`,
      caption: '',
      images: [],
      likes: 0,
      liked: false,
      pinned: false,
      createdAt: new Date().toISOString(),
    }
    updateData((d) => ({ ...d, posts: [newPost, ...d.posts] }))
  }

  const updatePost = (updated: GalleryPost) => {
    updateData((d) => ({
      ...d,
      posts: d.posts.map((p) => (p.id === updated.id ? updated : p)),
    }))
  }

  const deletePost = (id: string) => {
    updateData((d) => ({
      ...d,
      posts: d.posts.filter((p) => p.id !== id),
    }))
  }

  return (
    <div className="instagram-wall">
      <div className="ig-stories">
        <motion.button
          type="button"
          className="ig-story"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          aria-label="Scroll to posts"
        >
          <div className="ig-story__ring">
            <ProfileAvatar size="lg" className="profile-avatar--story" />
          </div>
        </motion.button>

        {data.posts.slice(0, 8).map((post, i) => (
          <motion.button
            key={post.id}
            type="button"
            className={`ig-story ${animatingPostId === post.id ? 'ig-story--active' : ''}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 1) * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigateToPost(post.id)}
            aria-label={`Go to post: ${post.caption.slice(0, 40) || 'Untitled'}`}
          >
            <div className="ig-story__ring">
              {post.images[0] ? (
                <img src={post.images[0]} alt="" />
              ) : (
                <ProfileAvatar size="lg" className="profile-avatar--story" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {allHashtags.length > 0 && (
        <div className="ig-hashtags">
          <button
            type="button"
            className={`ig-hashtag-chip ${activeHashtag === null ? 'ig-hashtag-chip--active' : ''}`}
            onClick={() => setActiveHashtag(null)}
          >
            All
          </button>
          {allHashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`ig-hashtag-chip ${activeHashtag?.toLowerCase() === tag.toLowerCase() ? 'ig-hashtag-chip--active' : ''}`}
              onClick={() =>
                setActiveHashtag(
                  activeHashtag?.toLowerCase() === tag.toLowerCase() ? null : tag,
                )
              }
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isEditMode && (
        <motion.button
          className="btn-primary ig-add-post"
          onClick={addPost}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Create New Post
        </motion.button>
      )}

      <div className="ig-feed" ref={feedRef}>
        <AnimatePresence mode="popLayout">
          {visiblePosts.length === 0 ? (
            <p className="ig-feed__empty">No posts match this hashtag.</p>
          ) : (
            visiblePosts.map((post) => (
              <motion.div
                key={post.id}
                ref={setPostRef(post.id)}
                className={animatingPostId === post.id ? 'post-landing' : ''}
                animate={
                  animatingPostId === post.id
                    ? {
                        scale: [1, 1.02, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(184, 134, 11, 0)',
                          '0 0 0 6px rgba(184, 134, 11, 0.25)',
                          '0 0 0 0 rgba(184, 134, 11, 0)',
                        ],
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <PostCard
                  post={post}
                  isEditMode={isEditMode}
                  onUpdate={updatePost}
                  onDelete={() => deletePost(post.id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
