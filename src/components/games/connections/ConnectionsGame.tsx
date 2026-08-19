import { AnimatePresence, motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
} from 'react'
import type { ConnectionsPuzzle, ConnectionsToggleResult } from '../../../types/connections'
import {
  applySolvedGroup,
  buildConnectionsEmojiLines,
  buildShareText,
  createConnectionsGameState,
  deselectAll,
  previewSubmitSelection,
  shuffleRemaining,
  toggleWordSelection,
} from '../../../utils/connectionsGame'
import {
  ConnectionsGroupMerge,
  type MergeRect,
  type MergingGroup,
} from './ConnectionsGroupMerge'
import { ConnectionsSolvedRow } from './ConnectionsSolvedRow'
import { ConnectionsTile } from './ConnectionsTile'

interface ConnectionsGameProps {
  puzzle: ConnectionsPuzzle
  previewOnly?: boolean
  canPlay?: boolean
  onPuzzleSolved?: (puzzleId: string, mistakes: number) => void
}

interface PendingMerge {
  category: MergingGroup['category']
  words: string[]
}

function captureTileRects(
  words: string[],
  gridEl: HTMLElement,
  boardEl: HTMLElement,
): MergeRect[] {
  const boardRect = boardEl.getBoundingClientRect()
  return words.map((word) => {
    const tile = gridEl.querySelector(`[data-word="${CSS.escape(word)}"]`)
    if (!tile) {
      return { left: 0, top: 0, width: 0, height: 0 }
    }
    const rect = tile.getBoundingClientRect()
    return {
      left: rect.left - boardRect.left,
      top: rect.top - boardRect.top,
      width: rect.width,
      height: rect.height,
    }
  })
}

function measureMergeTarget(
  gridEl: HTMLElement,
  targetEl: HTMLElement,
  boardEl: HTMLElement,
): MergeRect {
  const boardRect = boardEl.getBoundingClientRect()
  const gridRect = gridEl.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  return {
    left: gridRect.left - boardRect.left,
    top: targetRect.top - boardRect.top,
    width: gridRect.width,
    height: targetRect.height,
  }
}

export function ConnectionsGame({
  puzzle,
  previewOnly = false,
  canPlay: canPlayOverride,
  onPuzzleSolved,
}: ConnectionsGameProps) {
  const [state, setState] = useState(() => createConnectionsGameState(puzzle))
  const [shareToast, setShareToast] = useState(false)
  const [pendingMerge, setPendingMerge] = useState<PendingMerge | null>(null)
  const [mergingGroup, setMergingGroup] = useState<MergingGroup | null>(null)
  const [freshSolvedTitle, setFreshSolvedTitle] = useState<string | null>(null)

  const boardRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const mergePlaceholderRef = useRef<HTMLDivElement>(null)
  const pendingMergeRef = useRef<PendingMerge | null>(null)
  const solvedRecordedRef = useRef<string | null>(null)

  const canSubmit =
    state.selected.length === 4 &&
    state.status === 'playing' &&
    !pendingMerge &&
    !previewOnly &&
    (canPlayOverride ?? true)
  const canPlay =
    state.status === 'playing' &&
    !pendingMerge &&
    !previewOnly &&
    (canPlayOverride ?? true)
  const selectedSet = useMemo(() => new Set(state.selected), [state.selected])
  const mergingWords = useMemo(
    () => new Set(pendingMerge?.words ?? mergingGroup?.words ?? []),
    [pendingMerge, mergingGroup],
  )

  useLayoutEffect(() => {
    solvedRecordedRef.current = null
  }, [puzzle.id])

  useEffect(() => {
    if (previewOnly || state.status !== 'won' || !onPuzzleSolved) return
    if (solvedRecordedRef.current === puzzle.id) return
    solvedRecordedRef.current = puzzle.id
    void onPuzzleSolved(puzzle.id, state.mistakes)
  }, [onPuzzleSolved, previewOnly, puzzle.id, state.mistakes, state.status])

  useLayoutEffect(() => {
    if (!pendingMerge || !boardRef.current || !gridRef.current || !mergePlaceholderRef.current) {
      return
    }

    const rects = captureTileRects(
      pendingMerge.words,
      gridRef.current,
      boardRef.current,
    )
    const target = measureMergeTarget(
      gridRef.current,
      mergePlaceholderRef.current,
      boardRef.current,
    )

    pendingMergeRef.current = pendingMerge
    setMergingGroup({
      category: pendingMerge.category,
      words: pendingMerge.words,
      rects,
      target,
    })
    setPendingMerge(null)
  }, [pendingMerge])

  const emojiLines = useMemo(() => buildConnectionsEmojiLines(state), [state.solved])
  const shareText = useMemo(() => buildShareText(puzzle, state), [puzzle, state])

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setShareToast(true)
      window.setTimeout(() => setShareToast(false), 2200)
    } catch {
      window.prompt('Copy your result:', shareText)
    }
  }, [shareText])

  const handleReset = () => {
    setState(createConnectionsGameState(puzzle))
    setShareToast(false)
    setPendingMerge(null)
    setMergingGroup(null)
    pendingMergeRef.current = null
    setFreshSolvedTitle(null)
    solvedRecordedRef.current = null
  }

  const handleToggle = useCallback((word: string): ConnectionsToggleResult => {
    if (previewOnly || pendingMerge || mergingGroup) return 'ignored'
    let result: ConnectionsToggleResult = 'ignored'
    setState((current) => {
      const outcome = toggleWordSelection(current, word)
      result = outcome.result
      return outcome.next
    })
    return result
  }, [mergingGroup, pendingMerge, previewOnly])

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return

    const preview = previewSubmitSelection(state, puzzle)
    if (preview.kind === 'invalid') return

    if (preview.kind === 'wrong') {
      setState(preview.next)
      return
    }

    setPendingMerge({ category: preview.category, words: preview.words })
  }, [canSubmit, puzzle, state])

  const handleMergeComplete = useCallback(() => {
    const pending = pendingMergeRef.current
    if (!pending) {
      setMergingGroup(null)
      return
    }

    setState((current) => applySolvedGroup(current, pending.category, pending.words))
    setFreshSolvedTitle(pending.category.title)
    pendingMergeRef.current = null
    setMergingGroup(null)
    window.setTimeout(() => setFreshSolvedTitle(null), 100)
  }, [])

  const handleGridAnimationEnd = useCallback((event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.animationName !== 'connections-shake') return
    setState((current) => (current.shaking ? { ...current, shaking: false } : current))
  }, [])

  return (
    <div className={`connections-game ${previewOnly ? 'connections-game--preview' : ''}`}>
      <header className="connections-game__header">
        <p className="connections-game__eyebrow">Prefect Games</p>
        <h1 className="connections-game__title">Connections</h1>
        <p className="connections-game__subtitle">Create four groups of four!</p>
        <p className="connections-game__meta">Puzzle #{puzzle.number}</p>
      </header>

      <div className="connections-board" ref={boardRef}>
        <div className="connections-board__solved">
          {state.solved.map((group) => (
            <ConnectionsSolvedRow
              key={group.category.title}
              title={group.category.title}
              words={group.words}
              difficulty={group.category.difficulty}
              revealed={false}
              instant={freshSolvedTitle === group.category.title}
            />
          ))}
          {pendingMerge && (
            <div
              ref={mergePlaceholderRef}
              className="connections-solved connections-solved--placeholder"
              aria-hidden
            />
          )}
        </div>

        <div
          ref={gridRef}
          className={`connections-grid ${state.shaking ? 'connections-grid--shake' : ''}`}
          onAnimationEnd={handleGridAnimationEnd}
        >
          {state.remaining.map((word) => (
            <ConnectionsTile
              key={word}
              word={word}
              selected={selectedSet.has(word)}
              hidden={mergingWords.has(word)}
              disabled={!canPlay}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {mergingGroup && (
          <ConnectionsGroupMerge group={mergingGroup} onComplete={handleMergeComplete} />
        )}

        {state.message ? <p className="connections-game__message">{state.message}</p> : null}

        <div className="connections-game__mistakes" aria-label={`${state.mistakes} mistakes`}>
          <span className="connections-game__mistakes-label">Mistakes</span>
          <span className="connections-game__mistakes-count">{state.mistakes}</span>
        </div>

        {emojiLines.length > 0 && (
          <div className="connections-game__result-live">
            <p className="connections-game__result-live-label">Your result</p>
            <button
              type="button"
              className="connections-game__result-grid"
              onClick={handleShare}
              aria-label="Copy emoji result"
            >
              {emojiLines.map((line, index) => (
                <span key={index} className="connections-game__result-row">
                  {line}
                </span>
              ))}
            </button>
            <p className="connections-game__result-live-hint">Tap to copy</p>
          </div>
        )}

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
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!previewOnly && state.status === 'won' && (
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
              <h2>Perfect!</h2>
              <p>You found all four groups in {state.mistakes} mistake{state.mistakes === 1 ? '' : 's'}.</p>

              <button
                type="button"
                className="connections-game__result-grid connections-game__result-grid--modal"
                onClick={handleShare}
                aria-label="Copy emoji result"
              >
                {emojiLines.map((line, index) => (
                  <span key={index} className="connections-game__result-row">
                    {line}
                  </span>
                ))}
              </button>
              <p className="connections-game__result-copy-hint">Tap the emojis to copy your score</p>

              <div className="connections-game__modal-actions">
                <button
                  type="button"
                  className="connections-game__btn connections-game__btn--primary"
                  onClick={handleShare}
                >
                  Copy result
                </button>
                <button
                  type="button"
                  className="connections-game__btn connections-game__btn--secondary"
                  onClick={handleReset}
                >
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
