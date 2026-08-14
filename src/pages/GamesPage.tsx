import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const games = [
  {
    to: '/games/connections',
    title: 'Connections',
    description: 'Group sixteen words into four hidden categories — just like the NYT puzzle.',
    badge: 'Live',
    emoji: '🧩',
  },
]

export function GamesPage() {
  return (
    <div className="games-page">
      <header className="games-page__header">
        <motion.p
          className="games-page__eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Prefect Games
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          Play &amp; Puzzle
        </motion.h1>
        <motion.p
          className="games-page__subtitle"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Weekly brain-teasers for the prefect body.
        </motion.p>
      </header>

      <div className="games-page__grid">
        {games.map((game, index) => (
          <motion.div
            key={game.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.06 }}
          >
            <Link to={game.to} className="games-card">
              <span className="games-card__emoji" aria-hidden>
                {game.emoji}
              </span>
              <div className="games-card__body">
                <div className="games-card__title-row">
                  <h2>{game.title}</h2>
                  <span className="games-card__badge">{game.badge}</span>
                </div>
                <p>{game.description}</p>
              </div>
              <span className="games-card__cta">Play →</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
