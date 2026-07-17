import { motion } from 'framer-motion'

interface JourneyStarfieldProps {
  flying?: boolean
  direction?: 1 | -1
}

export function JourneyStarfield({ flying = false, direction = 1 }: JourneyStarfieldProps) {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    left: `${(i * 13.7) % 100}%`,
    top: `${(i * 19.3) % 100}%`,
    size: i % 7 === 0 ? 2.8 : i % 3 === 0 ? 1.6 : 1,
    delay: (i % 13) * 0.14,
    twinkle: 1.8 + (i % 6) * 0.4,
  }))

  const dust = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${(i * 27) % 100}%`,
    top: `${(i * 31) % 100}%`,
    size: 40 + (i % 5) * 18,
  }))

  return (
    <div className="journey-starfield" aria-hidden>
      <div className="journey-starfield__nebula journey-starfield__nebula--a" />
      <div className="journey-starfield__nebula journey-starfield__nebula--b" />
      <div className="journey-starfield__nebula journey-starfield__nebula--c" />

      {dust.map((d) => (
        <span
          key={`dust-${d.id}`}
          className="journey-starfield__dust"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
          }}
        />
      ))}

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="journey-starfield__star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: flying ? [0.2, 1, 0.15] : [0.12, 0.9, 0.12],
            scale: flying ? [1, 1.6, 1] : [0.85, 1.2, 0.85],
          }}
          transition={{
            duration: flying ? 0.22 : star.twinkle,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {flying &&
        Array.from({ length: 36 }).map((_, i) => (
          <motion.span
            key={`streak-${i}`}
            className={`journey-starfield__streak journey-starfield__streak--${direction > 0 ? 'up' : 'down'}`}
            style={{
              left: `${(i * 9.7 + 3) % 100}%`,
              width: 1 + (i % 3),
              height: 40 + (i % 6) * 14,
            }}
            initial={{ y: direction > 0 ? '-40vh' : '120vh', opacity: 0, rotate: direction > 0 ? 8 : -8 }}
            animate={{
              y: direction > 0 ? '130vh' : '-40vh',
              opacity: [0, 0.95, 0],
              x: direction > 0 ? [0, (i % 2 === 0 ? 18 : -14)] : [0, (i % 2 === 0 ? -16 : 12)],
            }}
            transition={{
              duration: (direction > 0 ? 0.38 : 0.55) + (i % 5) * 0.06,
              repeat: Infinity,
              delay: i * 0.028,
              ease: 'linear',
            }}
          />
        ))}
    </div>
  )
}
