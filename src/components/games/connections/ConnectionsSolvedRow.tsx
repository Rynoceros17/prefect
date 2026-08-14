import { motion } from 'framer-motion'
import type { ConnectionsDifficulty } from '../../../types/connections'
import { CONNECTIONS_DIFFICULTY_COLORS } from '../../../types/connections'

interface ConnectionsSolvedRowProps {
  title: string
  words: string[]
  difficulty: ConnectionsDifficulty
  revealed?: boolean
}

export function ConnectionsSolvedRow({
  title,
  words,
  difficulty,
  revealed = false,
}: ConnectionsSolvedRowProps) {
  return (
    <motion.div
      className={`connections-solved ${revealed ? 'connections-solved--revealed' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundColor: CONNECTIONS_DIFFICULTY_COLORS[difficulty] }}
    >
      <span className="connections-solved__title">{title}</span>
      <span className="connections-solved__words">{words.join(', ')}</span>
    </motion.div>
  )
}
