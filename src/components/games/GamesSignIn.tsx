import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useGamesPlayer } from '../../context/GamesPlayerContext'
import {
  GAMES_PLAYER_COLORS,
  GAMES_PLAYER_ICONS,
  isValidGamesEmail,
} from '../../types/games'

export function GamesSignIn() {
  const {
    player,
    signIn,
    isSigningIn,
    isProfileEditorOpen,
    closeProfileEditor,
  } = useGamesPlayer()
  const [name, setName] = useState(player?.name ?? '')
  const [email, setEmail] = useState(player?.email ?? '')
  const [icon, setIcon] = useState(player?.icon ?? GAMES_PLAYER_ICONS[0])
  const [color, setColor] = useState(player?.color ?? GAMES_PLAYER_COLORS[0])

  const mustSignIn = !player
  const modalOpen = mustSignIn || isProfileEditorOpen
  const emailValid = isValidGamesEmail(email)

  useEffect(() => {
    if (!player) return
    setName(player.name)
    setEmail(player.email)
    setIcon(player.icon)
    setColor(player.color)
  }, [player])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !emailValid) return
    await signIn({ name, email, icon, color })
  }

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="games-sign-in-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="games-sign-in-title"
        >
          <motion.div
            className="games-sign-in-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="games-sign-in__header">
              <h2 id="games-sign-in-title" className="games-sign-in__title">
                {mustSignIn ? 'Sign in to play' : 'Edit your profile'}
              </h2>
              <p className="games-sign-in__subtitle">
                {mustSignIn
                  ? 'Create your player profile with your email to unlock the puzzle and join the leaderboard.'
                  : 'Update your name, email, icon, or colour.'}
              </p>
            </header>

            <form className="games-sign-in__form" onSubmit={handleSubmit}>
              <label className="games-sign-in__field">
                <span>Your name</span>
                <input
                  className="games-sign-in__input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={24}
                  required
                  autoFocus
                />
              </label>

              <label className="games-sign-in__field">
                <span>Email</span>
                <input
                  className="games-sign-in__input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  required
                />
              </label>

              <fieldset className="games-sign-in__field">
                <legend>Icon</legend>
                <div className="games-sign-in__icons">
                  {GAMES_PLAYER_ICONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`games-sign-in__icon-btn ${icon === option ? 'games-sign-in__icon-btn--selected' : ''}`}
                      onClick={() => setIcon(option)}
                      aria-label={`Icon ${option}`}
                      aria-pressed={icon === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="games-sign-in__field">
                <legend>Colour</legend>
                <div className="games-sign-in__colors">
                  {GAMES_PLAYER_COLORS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`games-sign-in__color-btn ${color === option ? 'games-sign-in__color-btn--selected' : ''}`}
                      style={{ backgroundColor: option }}
                      onClick={() => setColor(option)}
                      aria-label={`Colour ${option}`}
                      aria-pressed={color === option}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="games-sign-in__preview">
                <span
                  className="games-sign-in__avatar games-sign-in__avatar--large"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </span>
                <div className="games-sign-in__preview-copy">
                  <span className="games-sign-in__preview-name">{name.trim() || 'Your name'}</span>
                  <span className="games-sign-in__preview-email">{email.trim() || 'your@email.com'}</span>
                </div>
              </div>

              <div className="games-sign-in__actions">
                {!mustSignIn && (
                  <button type="button" className="games-sign-in__secondary" onClick={closeProfileEditor}>
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="games-sign-in__submit"
                  disabled={isSigningIn || !name.trim() || !emailValid}
                >
                  {isSigningIn ? 'Saving…' : mustSignIn ? 'Start playing' : 'Save profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function GamesSignInLock({ locked, children }: { locked: boolean; children: ReactNode }) {
  return (
    <div className={`games-sign-in-lock ${locked ? 'games-sign-in-lock--active' : ''}`}>
      {children}
    </div>
  )
}
