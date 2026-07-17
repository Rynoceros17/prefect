import { motion, type TargetAndTransition, type Transition } from 'framer-motion'
import type { JourneySpaceIconKind } from '../../types'

interface JourneySpaceIconProps {
  kind: JourneySpaceIconKind
  active: boolean
  onClick?: () => void
}

const ICONS: Record<JourneySpaceIconKind, { label: string; viewBox: string }> = {
  ufo: { label: 'UFO', viewBox: '0 0 80 56' },
  asteroid: { label: 'Asteroid', viewBox: '0 0 64 64' },
  comet: { label: 'Comet', viewBox: '0 0 90 48' },
  satellite: { label: 'Satellite', viewBox: '0 0 72 72' },
}

const MOTION: Record<
  JourneySpaceIconKind,
  { animate: TargetAndTransition; transition: Transition }
> = {
  ufo: {
    animate: {
      y: [0, -14, -6, -10, 0],
      rotate: [0, -6, 6, -3, 0],
      scale: [1, 1.06, 1.02, 1.05, 1],
    },
    transition: { duration: 1.1, ease: [0.36, 0.07, 0.19, 0.97] },
  },
  asteroid: {
    animate: {
      rotate: [0, 180, 360],
      x: [0, 18, -8, 12, 0],
      y: [0, 6, -4, 2, 0],
    },
    transition: { duration: 1.15, ease: 'easeInOut' },
  },
  comet: {
    animate: {
      x: [0, 36, 48],
      y: [0, -8, -4],
      opacity: [1, 1, 0.85],
      scale: [1, 1.08, 0.95],
    },
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
  satellite: {
    animate: {
      rotate: [0, 12, -10, 8, 0],
      y: [0, -6, 0],
      scale: [1, 1.05, 1],
    },
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
}

function IconArt({ kind, active }: { kind: JourneySpaceIconKind; active: boolean }) {
  if (kind === 'ufo') {
    return (
      <svg viewBox={ICONS.ufo.viewBox} className="journey-space-icon__svg" aria-hidden>
        <defs>
          <radialGradient id="ufo-glow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="rgba(120,255,200,0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <motion.ellipse
          cx="40"
          cy="48"
          rx="22"
          ry="6"
          fill="url(#ufo-glow)"
          animate={active ? { opacity: [0.3, 0.9, 0.4], ry: [6, 10, 6] } : { opacity: 0.35, ry: 6 }}
          transition={{ duration: 0.9, repeat: active ? Infinity : 0 }}
        />
        <ellipse cx="40" cy="30" rx="28" ry="10" fill="#8a9cb8" />
        <ellipse cx="40" cy="28" rx="28" ry="10" fill="#c5d0e0" />
        <ellipse cx="40" cy="22" rx="14" ry="12" fill="#7ec8ff" opacity="0.85" />
        <ellipse cx="36" cy="19" rx="5" ry="3" fill="rgba(255,255,255,0.45)" />
        {[18, 28, 40, 52, 62].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy="32"
            r="2.5"
            fill={i % 2 ? '#ffe066' : '#ff6b6b'}
            animate={active ? { opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.35, repeat: active ? Infinity : 0, delay: i * 0.08 }}
          />
        ))}
      </svg>
    )
  }

  if (kind === 'asteroid') {
    return (
      <svg viewBox={ICONS.asteroid.viewBox} className="journey-space-icon__svg" aria-hidden>
        <path
          d="M34 8 L48 12 L58 24 L62 38 L54 52 L38 58 L22 52 L10 38 L12 22 L22 12 Z"
          fill="#6b5344"
        />
        <path
          d="M34 8 L48 12 L58 24 L62 38 L54 52 L38 58 L22 52 L10 38 L12 22 L22 12 Z"
          fill="#8a6f58"
          opacity="0.7"
        />
        <circle cx="28" cy="28" r="4" fill="#4a3828" opacity="0.55" />
        <circle cx="44" cy="36" r="5" fill="#4a3828" opacity="0.45" />
        <circle cx="36" cy="44" r="3" fill="#4a3828" opacity="0.5" />
        <path d="M20 20 L26 24" stroke="#3d3028" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'comet') {
    return (
      <svg viewBox={ICONS.comet.viewBox} className="journey-space-icon__svg" aria-hidden>
        <motion.path
          d="M8 28 C20 26 35 22 55 18 L70 14 L75 24 L58 28 C40 32 22 34 8 32 Z"
          fill="rgba(180,210,255,0.35)"
          animate={active ? { opacity: [0.2, 0.75, 0.3], x: [0, 8, 16] } : {}}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
        <motion.path
          d="M18 28 C28 27 42 24 58 20 L68 18 L72 26 L56 29 C42 31 28 32 18 30 Z"
          fill="rgba(255,220,160,0.45)"
          animate={active ? { opacity: [0.3, 0.9, 0.35], x: [0, 10, 20] } : {}}
          transition={{ duration: 0.75, ease: 'easeOut', delay: 0.05 }}
        />
        <circle cx="72" cy="22" r="10" fill="#e8dcc8" />
        <circle cx="69" cy="19" r="3" fill="rgba(255,255,255,0.5)" />
      </svg>
    )
  }

  return (
    <svg viewBox={ICONS.satellite.viewBox} className="journey-space-icon__svg" aria-hidden>
      <motion.g
        animate={active ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
      >
        <circle cx="36" cy="14" r="3" fill="#5ec8ff" />
        <line x1="36" y1="17" x2="36" y2="24" stroke="#8899aa" strokeWidth="2" />
      </motion.g>
      <rect x="28" y="24" width="16" height="22" rx="3" fill="#aab4c4" />
      <rect x="30" y="26" width="12" height="8" rx="1" fill="#334455" />
      <rect x="4" y="30" width="22" height="10" rx="2" fill="#1a2840" stroke="#3d5a80" strokeWidth="1.5" />
      <rect x="46" y="30" width="22" height="10" rx="2" fill="#1a2840" stroke="#3d5a80" strokeWidth="1.5" />
      <line x1="26" y1="35" x2="4" y2="35" stroke="#667788" strokeWidth="2" />
      <line x1="46" y1="35" x2="68" y2="35" stroke="#667788" strokeWidth="2" />
      {[8, 14, 20].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="40" stroke="#2a4060" strokeWidth="1" />
      ))}
      {[52, 58, 64].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="40" stroke="#2a4060" strokeWidth="1" />
      ))}
    </svg>
  )
}

export function JourneySpaceIcon({ kind, active, onClick }: JourneySpaceIconProps) {
  const meta = ICONS[kind]
  const motionProps = active ? MOTION[kind] : undefined

  return (
    <motion.button
      type="button"
      className={`journey-space-icon journey-space-icon--${kind} ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label={meta.label}
      animate={motionProps?.animate}
      transition={motionProps?.transition}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
    >
      <IconArt kind={kind} active={active} />
    </motion.button>
  )
}

export const JOURNEY_SPACE_ICONS: { kind: JourneySpaceIconKind; label: string; emoji: string }[] = [
  { kind: 'ufo', label: 'UFO', emoji: '🛸' },
  { kind: 'asteroid', label: 'Asteroid', emoji: '☄️' },
  { kind: 'comet', label: 'Comet', emoji: '💫' },
  { kind: 'satellite', label: 'Satellite', emoji: '🛰️' },
]
