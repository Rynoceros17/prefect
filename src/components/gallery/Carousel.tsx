import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ModalPortal } from '../ModalPortal'
import { useScrollLock } from '../../hooks/useScrollLock'
import type { PostAspectRatio, PostImageMeta } from '../../types'
import { DEFAULT_IMAGE_META, DEFAULT_POST_ASPECT_RATIO, getAspectRatioWidthFactor } from '../../utils/postImages'
import { CroppedImage } from './CroppedImage'

interface CarouselProps {
  images: string[]
  imageMeta?: PostImageMeta[]
  aspectRatio?: PostAspectRatio
  postId: string
}

interface CarouselStageProps {
  images: string[]
  metas: PostImageMeta[]
  aspectRatio: PostAspectRatio
  postId: string
  index: number
  direction: number
  onPaginate: (dir: number) => void
  onSelectIndex: (nextIndex: number) => void
  className?: string
  onFullscreen?: () => void
  fitViewport?: boolean
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
}

function CarouselStage({
  images,
  metas,
  aspectRatio,
  postId,
  index,
  direction,
  onPaginate,
  onSelectIndex,
  className = '',
  onFullscreen,
  fitViewport = false,
}: CarouselStageProps) {
  const widthFactor = getAspectRatioWidthFactor(aspectRatio)
  const stageStyle: React.CSSProperties = fitViewport
    ? {
        aspectRatio,
        width: `min(96vw, 1200px, calc((100dvh - 4rem) * ${widthFactor}))`,
        maxHeight: 'calc(100dvh - 4rem)',
      }
    : { aspectRatio }

  return (
    <div className={`carousel ${className}`.trim()} style={stageStyle}>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={`${postId}-${index}`}
          className="carousel__slide"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag={images.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) onPaginate(1)
            else if (info.offset.x > 50) onPaginate(-1)
          }}
        >
          <CroppedImage
            src={images[index]}
            meta={metas[index]}
            aspectRatio={aspectRatio}
            className="carousel__cropped"
          />
        </motion.div>
      </AnimatePresence>

      {onFullscreen && (
        <button
          type="button"
          className="carousel__fullscreen"
          onClick={(e) => {
            e.stopPropagation()
            onFullscreen()
          }}
          aria-label="View fullscreen"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="carousel__nav carousel__nav--prev"
            onClick={() => onPaginate(-1)}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel__nav carousel__nav--next"
            onClick={() => onPaginate(1)}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="carousel__dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
                onClick={() => onSelectIndex(i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Carousel({
  images,
  imageMeta,
  aspectRatio = DEFAULT_POST_ASPECT_RATIO,
  postId,
}: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const metas = images.map((_, i) => imageMeta?.[i] ?? DEFAULT_IMAGE_META)

  useScrollLock(lightboxOpen)

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir)
      setIndex((i) => {
        const next = i + dir
        if (next < 0) return images.length - 1
        if (next >= images.length) return 0
        return next
      })
    },
    [images.length],
  )

  const selectIndex = useCallback(
    (nextIndex: number) => {
      setDirection(nextIndex > index ? 1 : -1)
      setIndex(nextIndex)
    },
    [index],
  )

  useEffect(() => {
    setIndex(0)
  }, [postId])

  useEffect(() => {
    if (!lightboxOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') paginate(-1)
      if (e.key === 'ArrowRight') paginate(1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, paginate])

  if (images.length === 0) {
    return (
      <div className="carousel carousel--empty" style={{ aspectRatio }}>
        No images yet
      </div>
    )
  }

  const stageProps = {
    images,
    metas,
    aspectRatio,
    postId,
    index,
    direction,
    onPaginate: paginate,
    onSelectIndex: selectIndex,
  }

  return (
    <>
      <CarouselStage {...stageProps} onFullscreen={() => setLightboxOpen(true)} />

      <ModalPortal>
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              className="carousel-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxOpen(false)}
              onWheel={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
            >
              <motion.button
                type="button"
                className="carousel-lightbox__close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close fullscreen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                ×
              </motion.button>

              <motion.div
                className="carousel-lightbox__content"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CarouselStage {...stageProps} className="carousel--lightbox" fitViewport />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  )
}
