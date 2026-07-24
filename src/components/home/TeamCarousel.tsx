import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditMode } from '../../context/EditModeContext'
import type { LeaderProfile } from '../../types'
import { uploadImageFromFile } from '../../services/imageUpload'
import { adjustLeadersForRemovedImage, createLeaderAt } from '../../utils/migrateSiteData'
import { roleToSlug } from '../../utils/leaders'
import { preloadImageSources, heroCarouselUploadOptions } from '../../utils/imagePresets'
import { reorderImages } from '../../utils/postImages'
import { HomeImage } from './HomeImage'

interface TeamCarouselProps {
  images: string[]
  leaders: LeaderProfile[]
  onUpdateImages: (images: string[]) => void
  onUpdateLeaders: (leaders: LeaderProfile[]) => void
  onSelectLeader: (id: string) => void
}

export function TeamCarousel({
  images,
  leaders,
  onUpdateImages,
  onUpdateLeaders,
  onSelectLeader,
}: TeamCarouselProps) {
  const { isEditMode } = useEditMode()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const slideHostRef = useRef<HTMLDivElement>(null)
  const leadersRef = useRef(leaders)
  const didDragRef = useRef(false)

  leadersRef.current = leaders

  const safeImages = images.length > 0 ? images : ['']
  const currentIndex = Math.min(index, safeImages.length - 1)
  const slideLeaders = leaders.filter((leader) => leader.carouselIndex === currentIndex)

  useEffect(() => {
    if (safeImages.length <= 1) return
    const prev = (currentIndex - 1 + safeImages.length) % safeImages.length
    const next = (currentIndex + 1) % safeImages.length
    preloadImageSources([safeImages[prev], safeImages[next]])
  }, [currentIndex, safeImages])

  const paginate = useCallback(
    (dir: number) => {
      if (safeImages.length <= 1) return
      setDirection(dir)
      setIndex((i) => {
        const next = i + dir
        if (next < 0) return safeImages.length - 1
        if (next >= safeImages.length) return 0
        return next
      })
    },
    [safeImages.length],
  )

  const addLeaderAt = useCallback(
    (clientX: number, clientY: number) => {
      if (!isEditMode || !slideHostRef.current) return

      const rect = slideHostRef.current.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100

      const currentLeaders = leadersRef.current
      const newLeader = createLeaderAt(currentLeaders.length, x, y, currentIndex)
      onUpdateLeaders([...currentLeaders, newLeader])
      onSelectLeader(newLeader.id)
    },
    [isEditMode, currentIndex, onUpdateLeaders, onSelectLeader],
  )

  const handleSlideClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditMode || didDragRef.current) return
      if ((e.target as HTMLElement).closest('.hotspot')) return
      addLeaderAt(e.clientX, e.clientY)
    },
    [isEditMode, addLeaderAt],
  )

  const handleHotspotDrag = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (!isEditMode || !slideHostRef.current) return
      e.preventDefault()
      e.stopPropagation()
      setDraggingId(id)
      didDragRef.current = false

      const startX = e.clientX
      const startY = e.clientY

      const onMove = (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - startX) > 3 || Math.abs(ev.clientY - startY) > 3) {
          didDragRef.current = true
        }
        const rect = slideHostRef.current!.getBoundingClientRect()
        const x = Math.min(95, Math.max(5, ((ev.clientX - rect.left) / rect.width) * 100))
        const y = Math.min(95, Math.max(5, ((ev.clientY - rect.top) / rect.height) * 100))
        onUpdateLeaders(
          leadersRef.current.map((leader) => (leader.id === id ? { ...leader, x, y } : leader)),
        )
      }

      const onUp = () => {
        setDraggingId(null)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.setTimeout(() => {
          didDragRef.current = false
        }, 0)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [isEditMode, onUpdateLeaders],
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await uploadImageFromFile(
        file,
        `images/carousel/${crypto.randomUUID()}`,
        heroCarouselUploadOptions(),
      )
      onUpdateImages([...images, dataUrl])
      setIndex(images.length)
    } catch {
      window.alert('Could not process that image. Try a smaller file.')
    }
    e.target.value = ''
  }

  const handleRemove = (removeIndex: number) => {
    onUpdateImages(images.filter((_, i) => i !== removeIndex))
    onUpdateLeaders(adjustLeadersForRemovedImage(leaders, removeIndex))
    setIndex((i) => Math.max(0, Math.min(i, images.length - 2)))
  }

  const handleReorder = (from: number, to: number) => {
    onUpdateImages(reorderImages(images, from, to))
    if (currentIndex === from) setIndex(to)
    else if (from < currentIndex && to >= currentIndex) setIndex(currentIndex - 1)
    else if (from > currentIndex && to <= currentIndex) setIndex(currentIndex + 1)
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0, scale: 0.96 }),
  }

  return (
    <div className="team-carousel">
      <div className={`team-carousel__frame ${isEditMode ? 'team-carousel__frame--edit' : ''}`}>
        <div className="team-carousel__nebula" />
        <div className="team-carousel__stars" />

        <div
          ref={slideHostRef}
          className="team-carousel__slide-host"
          onClick={handleSlideClick}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={`${currentIndex}-${safeImages[currentIndex]}`}
              className="team-carousel__slide"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              drag={safeImages.length > 1 && !isEditMode ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) paginate(1)
                else if (info.offset.x > 50) paginate(-1)
              }}
            >
              {safeImages[currentIndex] ? (
                <HomeImage
                  src={safeImages[currentIndex]}
                  alt={`Team photo ${currentIndex + 1}`}
                  className="team-carousel__image"
                  priority
                  draggable={false}
                />
              ) : (
                <div className="team-carousel__placeholder">Add team photos in edit mode</div>
              )}
            </motion.div>
          </AnimatePresence>

          {slideLeaders.map((leader, i) => (
            <motion.button
              key={leader.id}
              type="button"
              className={`hotspot hotspot--${roleToSlug(leader.role)} ${draggingId === leader.id ? 'hotspot--dragging' : ''}`}
              style={{ left: `${leader.x}%`, top: `${leader.y}%` }}
              onClick={(e) => {
                e.stopPropagation()
                if (!didDragRef.current) onSelectLeader(leader.id)
              }}
              onPointerDown={(e) => {
                if (isEditMode) handleHotspotDrag(leader.id, e)
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`View ${leader.name}`}
            >
              <span className="hotspot__ring" />
              <span className="hotspot__ring hotspot__ring--2" />
              <span className="hotspot__dot" />
              <span className="hotspot__label">{leader.name.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>

        {isEditMode && (
          <div className="team-carousel__edit-hint">
            Tap the photo to add a prefect · Drag dots to reposition
          </div>
        )}

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              className="team-carousel__nav team-carousel__nav--prev"
              onClick={() => paginate(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="team-carousel__nav team-carousel__nav--next"
              onClick={() => paginate(1)}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        <div className="team-carousel__rim" />
      </div>

      {safeImages.length > 1 && (
        <div className="team-carousel__dots" role="tablist" aria-label="Team photos">
          {safeImages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Go to photo ${i + 1}`}
              className={`team-carousel__dot ${i === currentIndex ? 'team-carousel__dot--active' : ''}`}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1)
                setIndex(i)
              }}
            />
          ))}
        </div>
      )}

      {isEditMode && (
        <div className="team-carousel__editor">
          <label className="btn-secondary btn-small">
            Add photo
            <input type="file" accept="image/*" hidden onChange={handleUpload} />
          </label>

          <div className="team-carousel__editor-list">
            {images.map((src, i) => (
              <div key={`${src.slice(0, 24)}-${i}`} className="team-carousel__editor-item">
                <button
                  type="button"
                  className={`team-carousel__editor-thumb ${i === currentIndex ? 'team-carousel__editor-thumb--active' : ''}`}
                  onClick={() => setIndex(i)}
                >
                  <img src={src} alt="" />
                  <span className="team-carousel__editor-index">{i + 1}</span>
                </button>
                <div className="team-carousel__editor-actions">
                  {i > 0 && (
                    <button
                      type="button"
                      className="btn-ghost btn-small"
                      onClick={() => handleReorder(i, i - 1)}
                    >
                      ←
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      className="btn-ghost btn-small"
                      onClick={() => handleReorder(i, i + 1)}
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-ghost btn-small"
                    onClick={() => handleRemove(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
