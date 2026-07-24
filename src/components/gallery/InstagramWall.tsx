import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEditMode } from '../../context/EditModeContext'
import { useGalleryColumnCount } from '../../hooks/useGalleryColumnCount'
import { useSiteDataContext } from '../../context/SiteDataContext'
import type { GalleryPost } from '../../types'
import { collectHashtags, postMatchesHashtag } from '../../utils/hashtags'
import { countPostsByMonth, postMatchesMonth } from '../../utils/postDates'
import { distributePostsToColumns } from '../../utils/galleryMasonry'
import { DEFAULT_POST_ASPECT_RATIO } from '../../utils/postImages'
import { GalleryFilterBar, sortPostsByDate } from './GallerySidebar'
import { ProfileAvatar } from './ProfileAvatar'
import { PostCard } from './PostCard'

export function InstagramWall() {
  const { data, updateData } = useSiteDataContext()
  const { isEditMode } = useEditMode()
  const columnCount = useGalleryColumnCount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null)
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const [filterYear, setFilterYear] = useState(() => new Date().getFullYear())
  const [landingPostId, setLandingPostId] = useState<string | null>(null)
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  const highlightedPostId = searchParams.get('post')
  const animatingPostId = landingPostId ?? highlightedPostId

  const allHashtags = useMemo(
    () => collectHashtags(data.posts.map((p) => p.caption)),
    [data.posts],
  )

  const monthCounts = useMemo(
    () => countPostsByMonth(data.posts, filterYear),
    [data.posts, filterYear],
  )

  const visiblePosts = useMemo(() => {
    const filtered = data.posts.filter(
      (post) =>
        postMatchesHashtag(post.caption, activeHashtag) &&
        postMatchesMonth(post.createdAt, activeMonth, filterYear),
    )
    return sortPostsByDate(filtered)
  }, [data.posts, activeHashtag, activeMonth, filterYear])

  const masonryColumns = useMemo(
    () => distributePostsToColumns(visiblePosts, columnCount),
    [visiblePosts, columnCount],
  )

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

      const postDate = new Date(post.createdAt)
      if (
        activeMonth !== null &&
        (postDate.getMonth() + 1 !== activeMonth || postDate.getFullYear() !== filterYear)
      ) {
        setActiveMonth(null)
      }

      setLandingPostId(postId)
      setSearchParams({ post: postId }, { replace: true })
    },
    [activeHashtag, activeMonth, filterYear, data.posts, setSearchParams],
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
      aspectRatio: DEFAULT_POST_ASPECT_RATIO,
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

  const emptyMessage =
    activeHashtag && activeMonth
      ? 'No posts match this hashtag and month.'
      : activeHashtag
        ? 'No posts match this hashtag.'
        : activeMonth
          ? 'No posts in this month.'
          : 'No posts yet.'

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
            transition={{ delay: (i + 1) * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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

      <div className="ig-filter-header">
        <GalleryFilterBar
          hashtags={allHashtags}
          activeHashtag={activeHashtag}
          onHashtagChange={setActiveHashtag}
          activeMonth={activeMonth}
          onMonthChange={setActiveMonth}
          filterYear={filterYear}
          onFilterYearChange={setFilterYear}
          monthCounts={monthCounts}
        />

        {isEditMode && (
          <motion.button
            className="btn-primary ig-add-post"
            onClick={addPost}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Create New Post
          </motion.button>
        )}
      </div>

      <div className="ig-feed ig-feed--masonry" ref={feedRef}>
        <AnimatePresence mode="sync">
          {visiblePosts.length === 0 ? (
            <motion.p
              key="empty"
              className="ig-feed__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {emptyMessage}
            </motion.p>
          ) : (
            masonryColumns.map((columnPosts, columnIndex) => (
              <div key={`column-${columnIndex}`} className="ig-feed__column">
                {columnPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    ref={setPostRef(post.id)}
                    className={`ig-feed__cell ${animatingPostId === post.id ? 'post-landing' : ''}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <PostCard
                      post={post}
                      isEditMode={isEditMode}
                      onUpdate={updatePost}
                      onDelete={() => deletePost(post.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
