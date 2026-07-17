import { motion } from 'framer-motion'

interface JourneyNavProps {
  pageIndex: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  disabled?: boolean
}

/** Up = next stop (fly higher). Down = previous stop (return toward Earth). */
export function JourneyNav({ pageIndex, totalPages, onPrev, onNext, disabled }: JourneyNavProps) {
  const canGoUp = pageIndex < totalPages - 1
  const canGoDown = pageIndex > 0

  return (
    <div className="journey-nav">
      <motion.button
        type="button"
        className="journey-nav__btn"
        onClick={onNext}
        disabled={disabled || !canGoUp}
        aria-label="Fly up to next stop"
        title="Next stop"
        whileHover={canGoUp ? { scale: 1.08, y: -2 } : undefined}
        whileTap={canGoUp ? { scale: 0.94 } : undefined}
      >
        <span className="journey-nav__chevron journey-nav__chevron--up">⌃</span>
      </motion.button>

      <div className="journey-nav__track" aria-hidden>
        {Array.from({ length: totalPages }).map((_, i) => {
          // Dots: launch at bottom of track, highest stop at top
          const visualIndex = totalPages - 1 - i
          return (
            <span
              key={i}
              className={`journey-nav__dot ${visualIndex === pageIndex ? 'journey-nav__dot--active' : ''}`}
            />
          )
        })}
      </div>

      <motion.button
        type="button"
        className="journey-nav__btn"
        onClick={onPrev}
        disabled={disabled || !canGoDown}
        aria-label="Fly down to previous stop"
        title="Previous stop"
        whileHover={canGoDown ? { scale: 1.08, y: 2 } : undefined}
        whileTap={canGoDown ? { scale: 0.94 } : undefined}
      >
        <span className="journey-nav__chevron journey-nav__chevron--down">⌄</span>
      </motion.button>
    </div>
  )
}
