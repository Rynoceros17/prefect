import { motion } from 'framer-motion'
import type { JourneyPlanetType } from '../../types'

interface JourneyPlanetProps {
  name: string
  color: string
  size: number
  type: JourneyPlanetType
  landed?: boolean
  isActive?: boolean
}

export function JourneyPlanet({
  name,
  color,
  size,
  type,
  landed = false,
  isActive = false,
}: JourneyPlanetProps) {
  const scale = Math.max(0.1, size)

  return (
    <div className="journey-planet-wrap">
      <motion.div
        className={`journey-planet journey-planet--${type}`}
        style={
          {
            '--planet-color': color,
            '--planet-scale': scale,
          } as React.CSSProperties
        }
        initial={{ scale: 0.4, opacity: 0 }}
        animate={
          isActive
            ? { scale: landed ? scale : scale * 0.9, opacity: 1 }
            : { scale: scale * 0.8, opacity: 0.5 }
        }
        transition={{ type: 'spring', damping: 16, stiffness: 120 }}
      >
        <div className="journey-planet__stage">
          {type === 'ringed' && (
            <div className="journey-planet__rings" aria-hidden>
              <div className="journey-planet__ring journey-planet__ring--outer" />
              <div className="journey-planet__ring journey-planet__ring--inner" />
            </div>
          )}

          <motion.div
            className="journey-planet__aura"
            animate={
              isActive
                ? { opacity: [0.28, 0.6, 0.28], scale: [0.94, 1.1, 0.94] }
                : { opacity: 0.12 }
            }
            transition={{ duration: 3.4, repeat: Infinity }}
          />

          <div className="journey-planet__body">
            <div className="journey-planet__shade" />
            <div className="journey-planet__highlight" />
            {type === 'rocky' && (
              <>
                <div className="journey-planet__craters" />
                <div className="journey-planet__ridges" />
              </>
            )}
            {type === 'gas' && (
              <motion.div
                className="journey-planet__bands"
                animate={{ backgroundPositionY: ['0%', '100%'] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {type === 'ice' && (
              <>
                <div className="journey-planet__ice-sheen" />
                <div className="journey-planet__ice-cracks" />
              </>
            )}
            {type === 'moon' && (
              <>
                <div className="journey-planet__moon-shadow" />
                <div className="journey-planet__craters journey-planet__craters--dense" />
              </>
            )}
            {type === 'earth' && (
              <>
                <div className="journey-planet__earth-land" />
                <div className="journey-planet__earth-clouds" />
              </>
            )}
            <div className="journey-planet__atmosphere-rim" />
          </div>

          {landed && isActive && (
            <motion.div
              className="journey-planet__landing-glow"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0.4, 0.85, 0.5], scale: [0.85, 1.1, 1] }}
              transition={{ duration: 1.2 }}
            />
          )}
        </div>

        <motion.div
          className="journey-planet__shadow"
          animate={{ opacity: landed ? 0.55 : 0.2, scaleX: landed ? 1 : 0.7 }}
        />
      </motion.div>

      {type !== 'earth' && (
        <motion.h2
          className="journey-planet__name"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isActive ? 1 : 0.4, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          {name}
        </motion.h2>
      )}
    </div>
  )
}
