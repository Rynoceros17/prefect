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
    <div
      className={`connections-solved ${revealed ? 'connections-solved--revealed' : ''}`}
      style={{ backgroundColor: CONNECTIONS_DIFFICULTY_COLORS[difficulty] }}
    >
      <span className="connections-solved__title">{title}</span>
      <span className="connections-solved__words">{words.join(', ')}</span>
    </div>
  )
}
