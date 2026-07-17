import { motion } from 'framer-motion'

interface JourneyTitleProps {
  title: string
  isEditMode?: boolean
  onChange?: (title: string) => void
  style?: React.CSSProperties
  /** When true, fills the pin shell — no nested input box chrome */
  inPinboard?: boolean
}

export function JourneyTitle({
  title,
  isEditMode,
  onChange,
  style,
  inPinboard = false,
}: JourneyTitleProps) {
  const stars = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 17) % 84}%`,
    top: `${10 + (i * 29) % 80}%`,
    size: i % 3 === 0 ? 3 : 2,
    delay: (i % 7) * 0.25,
  }))

  if (isEditMode) {
    return (
      <input
        className={
          inPinboard
            ? 'journey-pin__gold-input'
            : 'journey-section__title-input edit-input'
        }
        value={title}
        onChange={(e) => onChange?.(e.target.value)}
        style={style}
      />
    )
  }

  return (
    <div
      className={`journey-title ${inPinboard ? 'journey-title--pin' : ''}`}
      style={style}
    >
      <div className="journey-title__starfield" aria-hidden>
        {stars.map((star) => (
          <motion.span
            key={star.id}
            className="journey-title__star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 2.2 + (star.id % 4) * 0.3, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </div>
      <motion.h1
        className="journey-title__text"
        style={{
          fontFamily: style?.fontFamily,
          fontWeight: style?.fontWeight,
          fontStyle: style?.fontStyle,
          textAlign: style?.textAlign,
          fontSize: style?.fontSize,
        }}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {title}
      </motion.h1>
    </div>
  )
}
