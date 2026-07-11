import { useLayoutEffect, useRef, useState } from 'react'
import { GALLERY_USERNAME } from '../../data/gallery'

function renderCaptionParts(text: string) {
  const parts = text.split(/(#[\w]+)/g)
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <span key={i} className="caption-hashtag">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

interface CaptionProps {
  caption: string
}

export function Caption({ caption }: CaptionProps) {
  const [expanded, setExpanded] = useState(false)
  const [isTruncatable, setIsTruncatable] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = textRef.current
    if (!el || expanded) return
    setIsTruncatable(el.scrollHeight > el.clientHeight + 2)
  }, [caption, expanded])

  return (
    <div className="post-card__caption">
      <p
        ref={textRef}
        className={`post-card__caption-text ${!expanded ? 'post-card__caption-text--clamped' : ''}`}
      >
        <strong>{GALLERY_USERNAME}</strong>{' '}
        {renderCaptionParts(caption)}
      </p>
      {isTruncatable && !expanded && (
        <button
          type="button"
          className="post-card__caption-more"
          onClick={() => setExpanded(true)}
        >
          more
        </button>
      )}
      {expanded && isTruncatable && (
        <button
          type="button"
          className="post-card__caption-more"
          onClick={() => setExpanded(false)}
        >
          less
        </button>
      )}
    </div>
  )
}
