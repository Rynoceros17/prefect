import { motion } from 'framer-motion'

interface ConnectionsTileProps {
  word: string
  selected: boolean
  disabled: boolean
  onToggle: () => void
}

export function ConnectionsTile({ word, selected, disabled, onToggle }: ConnectionsTileProps) {
  return (
    <motion.button
      type="button"
      layout
      layoutId={`connections-tile-${word}`}
      className={`connections-tile ${selected ? 'connections-tile--selected' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{
        layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.12 },
      }}
    >
      <span className="connections-tile__label">{word}</span>
    </motion.button>
  )
}
