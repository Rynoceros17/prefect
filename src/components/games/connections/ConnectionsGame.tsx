import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ConnectionsGameState, ConnectionsPuzzle } from '../../../types/connections'
import { CONNECTIONS_MAX_MISTAKES } from '../../../types/connections'
import {
  buildShareText,
  createConnectionsGameState,
  deselectAll,
  revealRemainingGroups,
  shuffleRemaining,
  submitSelection,
  toggleWordSelection,
} from '../../../utils/connectionsGame'
import { ConnectionsSolvedRow } from './ConnectionsSolvedRow'
import { ConnectionsTile } from './ConnectionsTile'

interface ConnectionsGameProps {
  puzzle: ConnectionsPuzzle
}

export function ConnectionsGame({ puzzle }: ConnectionsGameProps) {
  const [state, setState] = useState<ConnectionsGameState>(() => createConnectionsGameState(puzzle))
  const [shareToast, setShareToast] = useState(false)

  const canSubmit = state.selected.length === 4 && state.status === 'playing'
  const canPlay = state.status === 'playing'

  useEffect(() => {
    if (state.status !== 'lost' || state.revealedRemaining) return
    const timer = window.setTimeout(() => {
      setState((current) => revealRemainingGroups(current, puzzle))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [puzzle, state.revealedRemaining, state.status])

  useEffect(() => {
    if (!state.shaking) return
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, shaking: false }))
    }, 450)
    return () => window.clearTimeout(timer)
  }, [state.shaking])

  useEffect(() => {
    if (!state.rejectFlashWord) return
    const timer = window.setTimeout(() => {
      setState((current) =>
        current.rejectFlashWord ? { ...current, rejectFlashWord: null } : current,
      )
    }, 520)
    return () => window.clearTimeout(timer)
  }, [state.rejectFlashWord])

  const handleShare = useCallback(async () => {
    const text = buildShareText(puzzle, state)
    try {
      await navigator.clipboard.writeText(text)
      setShareToast(true)
      window.setTimeout(() => setShareToast(false), 2200)
    } catch {
      window.prompt('Copy your result:', text)
    }
  }, [puzzle, state])

  const handleReset = () => {
    setState(createConnectionsGameState(puzzle))
    setShareToast(false)
  }

  const mistakeDots = useMemo(
    () =>
      Array.from({ length: CONNECTIONS_MAX_MISTAKES }, (_, index) => index < state.mistakes),
    [state.mistakes],
  )

  return (
    <div className="connections-game">
      <header className="connections-game__header">
        <p className="connections-game__eyebrow">Prefect Games</p>
        <h1 className="connections-game__title">Connections</h1>
        <p className="connections-game__subtitle">Create four groups of four!</p>
        <p className="connections-game__meta">Puzzle #{puzzle.number}</p>
      </header>

      <div className="connections-board">
        <div className="connections-board__solved">
          <AnimatePresence initial={false}>
            {state.solved.map((group) => (
              <ConnectionsSolvedRow
                key={group.category.title}
                title={group.category.title}
                words={group.words}
                difficulty={group.category.difficulty}
                revealed={state.revealedRemaining && state.status === 'lost'}
              />
            ))}
          </AnimatePresence>
        </div>

        <LayoutGroup>
          <motion.div
            className={`connections-grid ${state.shaking ? 'connections-grid--shake' : ''}`}
            layout
          >
            <AnimatePresence mode="popLayout">
              {state.remaining.map((word) => (
                <ConnectionsTile
                  key={word}
                  word={word}
                  selected={state.selected.includes(word)}
                  rejectFlash={state.rejectFlashWord === word}
                  disabled={!canPlay}
                  onToggle={() => setState((current) => toggleWordSelection(current, word))}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          {state.message && (
            <motion.p
              key={state.message}
              className="connections-game__message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="connections-game__mistakes" aria-label={`${state.mistakes} of ${CONNECTIONS_MAX_MISTAKES} mistakes`}>
          {mistakeDots.map((filled, index) => (
            <span
              key={index}
              className={`connections-game__mistake-dot ${filled ? 'connections-game__mistake-dot--filled' : ''}`}
            />
          ))}
        </div>

        <div className="connections-game__actions">
          <button
            type="button"
            className="connections-game__btn connections-game__btn--secondary"
            onClick={() => setState((current) => shuffleRemaining(current))}
            disabled={!canPlay || state.remaining.length <= 1}
          >
            Shuffle
          </button>
          <button
            type="button"
            className="connections-game__btn connections-game__btn--secondary"
            onClick={() => setState((current) => deselectAll(current))}
            disabled={!canPlay || state.selected.length === 0}
          >
            Deselect all
          </button>
          <button
            type="button"
            className="connections-game__btn connections-game__btn--primary"
            onClick={() => setState((current) => submitSelection(current, puzzle))}
            disabled={!canSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(state.status === 'won' || state.status === 'lost') && (
          <motion.div
            className="connections-game__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="connections-game__modal"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            >
              <h2>{state.status === 'won' ? 'Perfect!' : 'Game over'}</h2>
              <p>
                {state.status === 'won'
                  ? 'You found all four groups.'
                  : 'Four mistakes — the remaining groups have been revealed.'}
              </p>
              <div className="connections-game__modal-actions">
                <button type="button" className="connections-game__btn connections-game__btn--primary" onClick={handleShare}>
                  Share results
                </button>
                <button type="button" className="connections-game__btn connections-game__btn--secondary" onClick={handleReset}>
                  Play again
                </button>
              </div>
              {shareToast && <p className="connections-game__share-toast">Copied to clipboard!</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
