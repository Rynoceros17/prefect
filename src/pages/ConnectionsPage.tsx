import { Link } from 'react-router-dom'
import { ConnectionsGame } from '../components/games/connections/ConnectionsGame'
import { EXAMPLE_CONNECTIONS_PUZZLE } from '../data/connectionsPuzzles'

export function ConnectionsPage() {
  return (
    <div className="connections-page">
      <ConnectionsGame puzzle={EXAMPLE_CONNECTIONS_PUZZLE} />
      <Link to="/games" className="connections-page__back">
        ← All Prefect Games
      </Link>
    </div>
  )
}
