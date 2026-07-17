import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_PREFIX = 'leadership-panel-pos-'

export interface PanelPosition {
  x: number
  y: number
}

function loadPosition(id: string): PanelPosition | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PanelPosition
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed
  } catch {
    /* ignore */
  }
  return null
}

function savePosition(id: string, position: PanelPosition) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(position))
  } catch {
    /* ignore */
  }
}

function clampPosition(position: PanelPosition, margin = 8): PanelPosition {
  const maxX = Math.max(margin, window.innerWidth - 120)
  const maxY = Math.max(margin, window.innerHeight - 48)
  return {
    x: Math.min(maxX, Math.max(margin, position.x)),
    y: Math.min(maxY, Math.max(margin, position.y)),
  }
}

export function useDraggablePanel(id: string, defaultPosition: () => PanelPosition) {
  const [position, setPosition] = useState<PanelPosition>(() => {
    return clampPosition(loadPosition(id) ?? defaultPosition())
  })
  const positionRef = useRef(position)

  positionRef.current = position

  useEffect(() => {
    const saved = loadPosition(id)
    setPosition(clampPosition(saved ?? defaultPosition()))
    // Only reload when panel id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const onResize = () => {
      setPosition((current) => clampPosition(current))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onMoveStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const origin = { ...positionRef.current }

      const onMove = (ev: PointerEvent) => {
        const next = clampPosition({
          x: origin.x + ev.clientX - startX,
          y: origin.y + ev.clientY - startY,
        })
        positionRef.current = next
        setPosition(next)
      }

      const onUp = () => {
        savePosition(id, positionRef.current)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [id],
  )

  return { position, onMoveStart }
}
