import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GALLERY_USERNAME } from '../../data/gallery'
import type { GalleryPost, PostAspectRatio, PostImageMeta } from '../../types'
import { uploadGalleryImagePair } from '../../services/imageUpload'
import { downloadPostImages } from '../../utils/downloadImages'
import {
  formatPostDate,
  fromDateInputValue,
  toDateInputValue,
} from '../../utils/postDates'
import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_POST_ASPECT_RATIO,
  compactPostFullImages,
  getPostDownloadUrls,
  mergePostFullImages,
  normalizeImageMeta,
  removePostImageAt,
  reorderImages,
  reorderPostImages,
} from '../../utils/postImages'
import { Caption } from './Caption'
import { Carousel } from './Carousel'
import { ImageCropEditor } from './ImageCropEditor'
import { PostImageStrip } from './PostImageStrip'
import { ProfileAvatar } from './ProfileAvatar'

interface PostCardProps {
  post: GalleryPost
  isEditMode: boolean
  onUpdate: (post: GalleryPost) => void
  onDelete: () => void
}

export function PostCard({ post, isEditMode, onUpdate, onDelete }: PostCardProps) {
  const postRef = useRef<HTMLElement>(null)
  const [showHearts, setShowHearts] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const [downloadToast, setDownloadToast] = useState(false)
  const [cropIndex, setCropIndex] = useState<number | null>(null)

  const imageMeta = normalizeImageMeta(post.images, post.imageMeta)
  const aspectRatio = post.aspectRatio ?? DEFAULT_POST_ASPECT_RATIO

  const updateWithMeta = (
    images: string[],
    meta: PostImageMeta[],
    fullImages?: string[],
  ) => {
    onUpdate({
      ...post,
      images,
      fullImages: fullImages ?? post.fullImages,
      imageMeta: meta,
    })
  }

  const handleLike = () => {
    const liked = !post.liked
    onUpdate({
      ...post,
      liked,
      likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
    })
    if (liked) {
      setShowHearts(true)
      setTimeout(() => setShowHearts(false), 800)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/gallery?post=${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = 20 - post.images.length
    const toAdd = files.slice(0, remaining)
    try {
      const pairs = await Promise.all(toAdd.map((file) => uploadGalleryImagePair(file, post.id)))
      const feedUrls = pairs.map((pair) => pair.feed)
      const fullUrls = pairs.map((pair) => pair.full)
      const images = [...post.images, ...feedUrls].slice(0, 20)
      const fullImages = mergePostFullImages(images, post.fullImages, fullUrls)
      updateWithMeta(
        images,
        normalizeImageMeta(images, [
          ...imageMeta,
          ...feedUrls.map(() => ({ panX: 0, panY: 0, zoom: 1 })),
        ]),
        fullImages,
      )
    } catch {
      window.alert('Could not process one or more images. Try smaller files.')
    }
    e.target.value = ''
  }

  const handleReorder = (from: number, to: number) => {
    const next = reorderPostImages(post.images, post.fullImages, from, to)
    onUpdate({
      ...post,
      images: next.images,
      fullImages: compactPostFullImages(next.images, next.fullImages),
      imageMeta: reorderImages(imageMeta, from, to),
    })
  }

  const handleRemoveImage = (index: number) => {
    const next = removePostImageAt(post.images, post.fullImages, index)
    updateWithMeta(
      next.images,
      imageMeta.filter((_, i) => i !== index),
      compactPostFullImages(next.images, next.fullImages),
    )
  }

  const handleCropSave = (index: number, meta: PostImageMeta) => {
    const metaCopy = [...imageMeta]
    metaCopy[index] = meta
    onUpdate({ ...post, imageMeta: metaCopy })
  }

  const handleDownload = async () => {
    if (!post.images.length) return
    try {
      await downloadPostImages(post.id, getPostDownloadUrls(post))
      setDownloadToast(true)
      window.setTimeout(() => setDownloadToast(false), 2000)
    } catch {
      window.alert('Could not download photos. Try again or open the image in a new tab.')
    }
  }

  const handleAspectRatio = (value: PostAspectRatio) => {
    onUpdate({ ...post, aspectRatio: value })
  }

  return (
    <article ref={postRef} className="post-card">
      <div className="post-card__header">
        <ProfileAvatar size="sm" />
        <div className="post-card__header-text">
          <span className="post-card__username">{GALLERY_USERNAME}</span>
          {isEditMode ? (
            <label className="post-card__date-edit">
              Date
              <input
                type="date"
                className="post-card__date-input"
                value={toDateInputValue(post.createdAt)}
                onChange={(e) =>
                  onUpdate({ ...post, createdAt: fromDateInputValue(e.target.value) })
                }
              />
            </label>
          ) : (
            <time className="post-card__date" dateTime={post.createdAt}>
              {formatPostDate(post.createdAt)}
            </time>
          )}
        </div>
        {post.pinned && <span className="post-card__pinned" title="Pinned">📌</span>}
      </div>

      <div className="post-card__media">
        <Carousel
          images={post.images}
          fullImages={post.fullImages}
          imageMeta={imageMeta}
          aspectRatio={aspectRatio}
          postId={post.id}
        />
      </div>

      <div className="post-card__actions">
        <div className="post-card__actions-left">
          <motion.button
            className={`action-btn ${post.liked ? 'action-btn--liked' : ''}`}
            onClick={handleLike}
            whileTap={{ scale: 1.4 }}
            aria-label={post.liked ? 'Unlike' : 'Like'}
          >
            {post.liked ? '❤️' : '🤍'}
            <AnimatePresence>
              {showHearts && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="floating-heart"
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        scale: 1.5,
                        x: (Math.random() - 0.5) * 80,
                        y: -60 - Math.random() * 40,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                    >
                      ❤️
                    </motion.span>
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            className="action-btn"
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            aria-label="Share"
          >
            ↗
          </motion.button>
          {post.images.length > 0 && (
            <motion.button
              className="action-btn"
              onClick={() => void handleDownload()}
              whileTap={{ scale: 0.9 }}
              aria-label="Download photos"
              title="Download photos"
            >
              ↓
            </motion.button>
          )}
        </div>
        {shareToast && <span className="share-toast">Link copied!</span>}
        {downloadToast && <span className="share-toast">Downloading…</span>}
      </div>

      <p className="post-card__likes">{post.likes.toLocaleString()} likes</p>

      {isEditMode ? (
        <div className="post-card__caption-edit-wrap">
          <textarea
            className="post-card__caption-edit"
            value={post.caption}
            onChange={(e) => onUpdate({ ...post, caption: e.target.value })}
            placeholder="Write a caption… use #hashtags"
            rows={3}
          />
          <p className="post-card__caption-hint">
            Tip: type <span className="caption-hashtag">#prefects</span> in your caption to add hashtags
          </p>
        </div>
      ) : (
        <Caption caption={post.caption} />
      )}

      {isEditMode && (
        <div className="post-card__edit-controls">
          <label className="post-card__aspect-label">
            Aspect ratio
            <select
              className="post-card__aspect-select"
              value={aspectRatio}
              onChange={(e) => handleAspectRatio(e.target.value as PostAspectRatio)}
            >
              {ASPECT_RATIO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {post.images.length > 0 && (
            <PostImageStrip
              images={post.images}
              imageMeta={imageMeta}
              onReorder={handleReorder}
              onCrop={setCropIndex}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="post-card__edit-buttons">
            <button
              type="button"
              className={`btn-secondary btn-small ${post.pinned ? 'btn-pinned-active' : ''}`}
              onClick={() => onUpdate({ ...post, pinned: !post.pinned })}
            >
              {post.pinned ? '📌 Pinned' : '📍 Pin to top'}
            </button>
            <label className="btn-secondary btn-small">
              Add Photos ({post.images.length}/20)
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleAddImages}
                disabled={post.images.length >= 20}
              />
            </label>
            <button type="button" className="btn-danger btn-small" onClick={onDelete}>
              Delete Post
            </button>
          </div>
        </div>
      )}

      {cropIndex !== null && post.images[cropIndex] && (
        <ImageCropEditor
          imageUrl={post.images[cropIndex]}
          aspectRatio={aspectRatio}
          meta={imageMeta[cropIndex]}
          onSave={(meta) => handleCropSave(cropIndex, meta)}
          onClose={() => setCropIndex(null)}
        />
      )}
    </article>
  )
}
