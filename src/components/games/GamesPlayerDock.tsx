import { motion } from 'framer-motion'
import { useGamesPlayer } from '../../context/GamesPlayerContext'

export function GamesPlayerDock() {
  const { player, openProfileEditor, signOut } = useGamesPlayer()

  if (!player) return null

  return (
    <div className="games-player-dock-anchor">
      <motion.aside
        className="games-player-dock"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Signed in player"
      >
        <div className="games-player-dock__profile">
          <span className="games-player-dock__avatar" style={{ backgroundColor: player.color }}>
            {player.icon}
          </span>
          <div className="games-player-dock__copy">
            <p className="games-player-dock__label">Playing as</p>
            <p className="games-player-dock__name">{player.name}</p>
          </div>
        </div>

        <div className="games-player-dock__actions">
          <button type="button" className="games-player-dock__btn" onClick={openProfileEditor}>
            Edit profile
          </button>
          <button type="button" className="games-player-dock__btn games-player-dock__btn--muted" onClick={signOut}>
            Sign out
          </button>
        </div>
      </motion.aside>
    </div>
  )
}
