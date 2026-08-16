import { motion } from 'framer-motion'

interface ConnectionsTileProps {
  word: string
  selected: boolean
  rejectFlash: boolean
  disabled: boolean
  onToggle: () => void
}

export function ConnectionsTile({
  word,
  selected,
  rejectFlash,
  disabled,
  onToggle,
}: ConnectionsTileProps) {
  return (
    <motion.button
      type="button"
      layout
      layoutId={`connections-tile-${word}`}
      className={`connections-tile ${selected ? 'connections-tile--selected' : ''} ${rejectFlash ? 'connections-tile--reject' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      animate={
        rejectFlash
          ? {
              x: [0, -7, 7, -5, 5, -3, 0],
              backgroundColor: ['#efefe6', '#fbcfd4', '#f8d7da', '#fbcfd4', '#efefe6'],
            }
          : undefined
      }
      whileTap={disabled || rejectFlash ? undefined : { scale: 0.97 }}
      transition={{
        layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.12 },
        x: { duration: 0.45, ease: 'easeInOut' },
        backgroundColor: { duration: 0.45, ease: 'easeInOut' },
      }}
    >
      <span className="connections-tile__label">{word}</span>
    </motion.button>
  )
}
