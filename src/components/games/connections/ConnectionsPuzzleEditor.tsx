import { useMemo, type CSSProperties } from 'react'
import type { ConnectionsDifficulty, ConnectionsPuzzle } from '../../../types/connections'
import {
  CONNECTIONS_DIFFICULTY_COLORS,
  CONNECTIONS_DIFFICULTY_LABELS,
} from '../../../types/connections'
import {
  updateConnectionsCategory,
  updateConnectionsWord,
  validateConnectionsPuzzle,
} from '../../../utils/connectionsPuzzle'

interface ConnectionsPuzzleEditorProps {
  puzzle: ConnectionsPuzzle
  onChange: (puzzle: ConnectionsPuzzle) => void
}

export function ConnectionsPuzzleEditor({ puzzle, onChange }: ConnectionsPuzzleEditorProps) {
  const validation = useMemo(() => validateConnectionsPuzzle(puzzle), [puzzle])

  const allWords = useMemo(
    () => puzzle.categories.flatMap((category) => category.words.map((word) => word.trim()).filter(Boolean)),
    [puzzle.categories],
  )

  return (
    <section className="connections-editor" aria-label="Edit Connections puzzle">
      <header className="connections-editor__header">
        <div>
          <p className="connections-editor__eyebrow">Edit mode</p>
          <h2 className="connections-editor__title">Puzzle editor</h2>
          <p className="connections-editor__hint">
            Set four groups of four words. Players will see the words shuffled — only you see the answers here.
          </p>
        </div>
        <label className="connections-editor__number">
          <span>Puzzle #</span>
          <input
            className="edit-input edit-input--small"
            type="number"
            min={1}
            value={puzzle.number}
            onChange={(event) =>
              onChange({
                ...puzzle,
                number: Math.max(1, Number.parseInt(event.target.value, 10) || 1),
              })
            }
          />
        </label>
      </header>

      <div className="connections-editor__groups">
        {puzzle.categories.map((category, categoryIndex) => {
          const color = CONNECTIONS_DIFFICULTY_COLORS[category.difficulty]
          return (
            <article
              key={categoryIndex}
              className="connections-editor__group"
              style={{ '--group-color': color } as CSSProperties}
            >
              <div className="connections-editor__group-head">
                <span className="connections-editor__group-badge">
                  {CONNECTIONS_DIFFICULTY_LABELS[category.difficulty]}
                </span>
                <select
                  className="connections-editor__difficulty"
                  value={category.difficulty}
                  aria-label={`Difficulty for group ${categoryIndex + 1}`}
                  onChange={(event) =>
                    onChange(
                      updateConnectionsCategory(puzzle, categoryIndex, {
                        difficulty: Number.parseInt(event.target.value, 10) as ConnectionsDifficulty,
                      }),
                    )
                  }
                >
                  {(Object.entries(CONNECTIONS_DIFFICULTY_LABELS) as [string, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <label className="connections-editor__field">
                <span>Group name</span>
                <input
                  className="edit-input"
                  value={category.title}
                  placeholder="e.g. School Houses"
                  onChange={(event) =>
                    onChange(
                      updateConnectionsCategory(puzzle, categoryIndex, { title: event.target.value }),
                    )
                  }
                />
              </label>

              <div className="connections-editor__words">
                {category.words.map((word, wordIndex) => (
                  <label key={wordIndex} className="connections-editor__word">
                    <span>Word {wordIndex + 1}</span>
                    <input
                      className="edit-input"
                      value={word}
                      placeholder={`Word ${wordIndex + 1}`}
                      onChange={(event) =>
                        onChange(
                          updateConnectionsWord(puzzle, categoryIndex, wordIndex, event.target.value),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </article>
          )
        })}
      </div>

      <footer className="connections-editor__footer">
        <div className="connections-editor__status">
          {validation.ok ? (
            <p className="connections-editor__status-ok">Ready — {allWords.length} unique words</p>
          ) : (
            <ul className="connections-editor__status-errors">
              {validation.errors.slice(0, 4).map((error) => (
                <li key={error}>{error}</li>
              ))}
              {validation.errors.length > 4 && (
                <li>…and {validation.errors.length - 4} more issues</li>
              )}
            </ul>
          )}
          {validation.warnings.map((warning) => (
            <p key={warning} className="connections-editor__status-warning">
              {warning}
            </p>
          ))}
        </div>

        <div className="connections-editor__preview" aria-label="All puzzle words">
          {allWords.map((word) => (
            <span key={word} className="connections-editor__preview-chip">
              {word}
            </span>
          ))}
        </div>
      </footer>
    </section>
  )
}
