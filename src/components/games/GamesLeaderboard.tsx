import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useGamesPlayer } from '../../context/GamesPlayerContext'
import {
  formatAverageMistakes,
  getLeaderboardTier,
  sortLeaderboardPlayers,
  type GamesLeaderboardSortKey,
} from '../../types/games'

export function GamesLeaderboard() {
  const { leaderboard, player, isLeaderboardLoading, isFirebaseEnabled } = useGamesPlayer()
  const [sortBy, setSortBy] = useState<GamesLeaderboardSortKey>('solved')

  const sortedLeaderboard = useMemo(
    () => sortLeaderboardPlayers(leaderboard, sortBy),
    [leaderboard, sortBy],
  )

  return (
    <section className="games-leaderboard" aria-label="Prefect Games leaderboard">
      <header className="games-leaderboard__header">
        <h2 className="games-leaderboard__title">Leaderboard</h2>
        <p className="games-leaderboard__subtitle">Click a column heading to sort</p>
      </header>

      {!isFirebaseEnabled && (
        <p className="games-leaderboard__notice">Leaderboard syncs on the hosted site.</p>
      )}

      {isLeaderboardLoading ? (
        <div className="games-leaderboard__loading">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="games-leaderboard__skeleton" />
          ))}
        </div>
      ) : sortedLeaderboard.length === 0 ? (
        <p className="games-leaderboard__empty">Be the first to solve a puzzle!</p>
      ) : (
        <div className="games-leaderboard__table">
          <div className="games-leaderboard__columns" role="row">
            <span className="games-leaderboard__col games-leaderboard__col--rank">#</span>
            <span className="games-leaderboard__col games-leaderboard__col--avatar" aria-hidden />
            <span className="games-leaderboard__col games-leaderboard__col--player">Player</span>
            <button
              type="button"
              className={`games-leaderboard__sort games-leaderboard__col games-leaderboard__col--solved ${sortBy === 'solved' ? 'games-leaderboard__sort--active' : ''}`}
              onClick={() => setSortBy('solved')}
              aria-sort={sortBy === 'solved' ? 'descending' : 'none'}
            >
              Solved
              {sortBy === 'solved' ? ' ↓' : ''}
            </button>
            <button
              type="button"
              className={`games-leaderboard__sort games-leaderboard__col games-leaderboard__col--avg ${sortBy === 'avgMistakes' ? 'games-leaderboard__sort--active' : ''}`}
              onClick={() => setSortBy('avgMistakes')}
              aria-sort={sortBy === 'avgMistakes' ? 'ascending' : 'none'}
            >
              Avg mistakes
              {sortBy === 'avgMistakes' ? ' ↑' : ''}
            </button>
          </div>

          <ol className="games-leaderboard__list">
            {sortedLeaderboard.map((entry, index) => {
              const rank = index + 1
              const tier = getLeaderboardTier(rank)
              const isCurrentPlayer = player?.id === entry.id

              return (
                <motion.li
                  key={entry.id}
                  className={[
                    'games-leaderboard__row',
                    `games-leaderboard__row--${tier}`,
                    isCurrentPlayer ? 'games-leaderboard__row--you' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.42,
                    delay: index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  layout
                >
                  <span className="games-leaderboard__col games-leaderboard__col--rank games-leaderboard__rank">
                    {tier === 'gold' && '🥇'}
                    {tier === 'silver' && '🥈'}
                    {tier === 'bronze' && '🥉'}
                    {tier === 'default' && rank}
                  </span>

                  <span
                    className="games-leaderboard__col games-leaderboard__col--avatar games-leaderboard__avatar"
                    style={{ backgroundColor: entry.color }}
                  >
                    {entry.icon}
                  </span>

                  <div className="games-leaderboard__col games-leaderboard__col--player games-leaderboard__info">
                    <span className="games-leaderboard__name">
                      {entry.name}
                      {isCurrentPlayer ? ' (you)' : ''}
                    </span>
                  </div>

                  <span className="games-leaderboard__col games-leaderboard__col--solved games-leaderboard__score">
                    {entry.solveCount}
                  </span>

                  <span className="games-leaderboard__col games-leaderboard__col--avg games-leaderboard__avg">
                    {formatAverageMistakes(entry)}
                  </span>
                </motion.li>
              )
            })}
          </ol>
        </div>
      )}
    </section>
  )
}
