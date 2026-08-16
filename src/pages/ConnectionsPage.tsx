import { ConnectionsGame } from '../components/games/connections/ConnectionsGame'
import { EXAMPLE_CONNECTIONS_PUZZLE } from '../data/connectionsPuzzles'

export function ConnectionsPage() {
  return (
    <div className="connections-page">
      <ConnectionsGame puzzle={EXAMPLE_CONNECTIONS_PUZZLE} />
    </div>
  )
}
