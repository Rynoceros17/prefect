import { useState } from 'react'
import type { ConnectionsToggleResult } from '../../../types/connections'

interface ConnectionsTileProps {
  word: string
  selected: boolean
  hidden?: boolean
  disabled: boolean
  onToggle: (word: string) => ConnectionsToggleResult
}

export function ConnectionsTile({
  word,
  selected,
  hidden = false,
  disabled,
  onToggle,
}: ConnectionsTileProps) {
  const [rejecting, setRejecting] = useState(false)

  const handleClick = () => {
    if (disabled) return
    const result = onToggle(word)
    if (result === 'rejected') {
      setRejecting(true)
    }
  }

  return (
    <button
      type="button"
      data-word={word}
      className={[
        'connections-tile',
        selected ? 'connections-tile--selected' : '',
        rejecting ? 'connections-tile--reject' : '',
        hidden ? 'connections-tile--hidden' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.animationName === 'connections-tile-reject') {
          setRejecting(false)
        }
      }}
    >
      <span className="connections-tile__label">{word}</span>
    </button>
  )
}
