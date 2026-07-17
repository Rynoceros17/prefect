import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'

export type RocketState = 'idle' | 'boost' | 'flying' | 'approach' | 'landing' | 'landed'

interface JourneyRocketProps {
  state: RocketState
  /** +1 = ascending to next, -1 = descending toward Earth */
  direction?: 1 | -1
}

export function JourneyRocket({ state, direction = 1 }: JourneyRocketProps) {
  const controls = useAnimationControls()
  const flameControls = useAnimationControls()

  useEffect(() => {
    const run = async () => {
      if (state === 'idle') {
        await controls.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          transition: { duration: 0.45 },
        })
        controls.start({
          y: [0, -7, 0],
          rotate: [0, -0.6, 0.6, 0],
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        })
        flameControls.start({ scaleY: 0.28, opacity: 0.28, transition: { duration: 0.3 } })
        return
      }

      if (state === 'boost') {
        flameControls.start({
          scaleY: [1, 1.55, 1.15],
          opacity: 1,
          transition: { duration: 0.22, repeat: Infinity },
        })
        if (direction > 0) {
          // Nose up — take off
          await controls.start({
            x: 0,
            y: [0, 10, -6],
            rotate: [0, 3, -4],
            scale: [1, 0.97, 1.03],
            transition: { duration: 0.4, ease: 'easeOut' },
          })
        } else {
          // Flip to face down before descending
          await controls.start({
            x: 0,
            y: [0, -8],
            rotate: [0, 90, 180],
            scale: [1, 1.04, 1],
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          })
        }
        return
      }

      if (state === 'flying') {
        flameControls.start({
          scaleY: [0.9, 1.5, 1],
          scaleX: [1, 0.78, 1],
          opacity: [0.85, 1, 0.8],
          transition: { duration: 0.16, repeat: Infinity },
        })
        if (direction > 0) {
          controls.start({
            x: [0, -44, 32, -14, 0],
            y: [0, -20, -8, -24, -10],
            rotate: [0, -14, 10, -6, -2],
            scale: [1.03, 1.07, 1.02, 1.05, 1.02],
            transition: { duration: 1.5, ease: [0.4, 0.05, 0.2, 1] },
          })
        } else {
          // Fly nose-down (rotated 180)
          controls.start({
            x: [0, 48, -36, 18, 0],
            y: [0, 14, 6, 18, 8],
            rotate: [180, 188, 172, 182, 180],
            scale: [1, 0.96, 1.02, 0.98, 1],
            transition: { duration: 1.65, ease: [0.35, 0.1, 0.25, 1] },
          })
        }
        return
      }

      if (state === 'approach') {
        flameControls.start({
          scaleY: [0.7, 1.05, 0.7],
          opacity: [0.7, 0.9, 0.65],
          transition: { duration: 0.22, repeat: Infinity },
        })
        if (direction > 0) {
          await controls.start({
            x: 0,
            y: -4,
            rotate: -2,
            scale: 1,
            transition: { duration: 0.3, ease: 'easeOut' },
          })
        } else {
          // Flip upright again before landing
          await controls.start({
            x: 0,
            y: 6,
            rotate: [180, 90, 0],
            scale: 1,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          })
        }
        return
      }

      if (state === 'landing' || state === 'landed') {
        flameControls.start({
          scaleY: [0.85, 0.4, 0.18],
          opacity: [0.85, 0.45, 0.12],
          transition: { duration: 0.7 },
        })
        await controls.start({
          x: [0, direction > 0 ? -4 : 4, 0],
          y: [direction > 0 ? -4 : 6, 70, 82, 78],
          rotate: [0, 4, -1, 0],
          scale: [1, 1.02, 0.98, 1],
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        })
        if (state === 'landed') {
          controls.start({
            y: [78, 76, 78],
            transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
          })
        }
      }
    }

    void run()
  }, [state, direction, controls, flameControls])

  const thrusterActive =
    state === 'boost' || state === 'flying' || state === 'approach' || state === 'landing'

  return (
    <motion.div className={`journey-rocket journey-rocket--${state}`} animate={controls}>
      <div className="journey-rocket__body">
        <svg className="journey-rocket__svg" viewBox="0 0 90 160" aria-hidden>
          <defs>
            <linearGradient id="jr-body" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c5ccd8" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e8ecf4" />
              <stop offset="100%" stopColor="#9aa3b5" />
            </linearGradient>
            <linearGradient id="jr-nose" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff1b8" />
              <stop offset="55%" stopColor="#f0d78c" />
              <stop offset="100%" stopColor="#b8922a" />
            </linearGradient>
            <linearGradient id="jr-fin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e07040" />
              <stop offset="100%" stopColor="#8b1538" />
            </linearGradient>
            <radialGradient id="jr-window" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#9ee7ff" />
              <stop offset="55%" stopColor="#2a5a9e" />
              <stop offset="100%" stopColor="#0b1a3a" />
            </radialGradient>
          </defs>

          <path d="M28 88 L8 128 L28 112 Z" fill="url(#jr-fin)" />
          <path d="M62 88 L82 128 L62 112 Z" fill="url(#jr-fin)" />
          <path d="M40 100 L34 130 L45 130 L50 100 Z" fill="#6b1028" opacity="0.85" />
          <rect x="28" y="42" width="34" height="72" rx="8" fill="url(#jr-body)" />
          <rect x="32" y="48" width="4" height="58" rx="2" fill="rgba(255,255,255,0.45)" />
          <line x1="30" y1="70" x2="60" y2="70" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          <line x1="30" y1="92" x2="60" y2="92" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          <path d="M45 6 L62 44 H28 Z" fill="url(#jr-nose)" />
          <path d="M45 12 L54 36 H36 Z" fill="rgba(255,255,255,0.28)" />
          <circle cx="45" cy="68" r="10" fill="url(#jr-window)" stroke="#5ec8ff" strokeWidth="2.2" />
          <circle cx="42" cy="64" r="3" fill="rgba(255,255,255,0.35)" />
          <rect x="33" y="112" width="24" height="16" rx="4" fill="#5c0e25" />
          <rect x="37" y="116" width="16" height="8" rx="2" fill="#1a1020" />
          <circle cx="45" cy="120" r="3.5" fill="#ffb347" opacity="0.7" />
        </svg>

        <motion.div className="journey-rocket__flame" animate={flameControls}>
          <span className="journey-rocket__flame-core" />
          <span className="journey-rocket__flame-mid" />
          <span className="journey-rocket__flame-outer" />
        </motion.div>
      </div>

      {thrusterActive && (
        <>
          <motion.div
            className="journey-rocket__exhaust"
            animate={{ opacity: [0.25, 0.75, 0.2], scale: [0.7, 1.25, 0.85] }}
            transition={{ duration: 0.26, repeat: Infinity }}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.span
              key={i}
              className="journey-rocket__spark"
              style={{ left: `calc(50% + ${(i - 3.5) * 5}px)` }}
              animate={{
                y: [0, 40 + i * 8],
                opacity: [0.95, 0],
                scale: [1, 0.2],
              }}
              transition={{
                duration: 0.3 + i * 0.03,
                repeat: Infinity,
                delay: i * 0.04,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  )
}
