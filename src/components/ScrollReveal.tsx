import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
}

const offsets = {
  up: { y: 60, x: 0, scale: 1 },
  down: { y: -60, x: 0, scale: 1 },
  left: { x: 60, y: 0, scale: 1 },
  right: { x: -60, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.85 },
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const offset = offsets[direction]

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, scale: 1 }
          : { opacity: 0, ...offset }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
