import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { PostAspectRatio, PostImageMeta } from '../../types'
import { DEFAULT_IMAGE_META } from '../../utils/postImages'
import { CroppedImage } from './CroppedImage'

interface CarouselProps {
  images: string[]
  imageMeta?: PostImageMeta[]
  aspectRatio?: PostAspectRatio
  postId: string
}

export function Carousel({ images, imageMeta, aspectRatio = '1', postId }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const metas = images.map((_, i) => imageMeta?.[i] ?? DEFAULT_IMAGE_META)

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

  useEffect(() => {
    setIndex(0)
  }, [postId])

  if (images.length === 0) {
    return (
      <div className="carousel carousel--empty" style={{ aspectRatio }}>
        No images yet
      </div>
    )
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="carousel" style={{ aspectRatio }}>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={`${postId}-${index}`}
          className="carousel__slide"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag={images.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) paginate(1)
            else if (info.offset.x > 50) paginate(-1)
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

      {images.length > 1 && (
        <>
          <button
            className="carousel__nav carousel__nav--prev"
            onClick={() => paginate(-1)}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            className="carousel__nav carousel__nav--next"
            onClick={() => paginate(1)}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="carousel__dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1)
                  setIndex(i)
                }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
