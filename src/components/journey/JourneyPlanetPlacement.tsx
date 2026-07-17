import { useRef } from 'react'

interface JourneyPlanetPlacementProps {
  planetY: number
  isEditMode?: boolean
  onPlanetYChange?: (y: number) => void
  children: React.ReactNode
}

function clampY(y: number) {
  return Math.max(5, Math.min(95, y))
}

export function JourneyPlanetPlacement({
  planetY,
  isEditMode = false,
  onPlanetYChange,
  children,
}: JourneyPlanetPlacementProps) {
  const dragRef = useRef<{ startY: number; originY: number; sectionHeight: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isEditMode || !onPlanetYChange) return
    const section = (e.currentTarget as HTMLElement).closest('.journey-section')
    if (!section) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      startY: e.clientY,
      originY: planetY,
      sectionHeight: section.getBoundingClientRect().height,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !onPlanetYChange) return
    const deltaPercent = ((e.clientY - dragRef.current.startY) / dragRef.current.sectionHeight) * 100
    onPlanetYChange(clampY(dragRef.current.originY + deltaPercent))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  return (
    <div
      className={`journey-section__planet-center ${isEditMode ? 'journey-section__planet-center--edit' : ''}`}
      style={{ top: `${planetY}%` }}
    >
      <div
        className="journey-section__planet-drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
      {isEditMode && (
        <p className="journey-section__planet-drag-hint">Drag planet up or down</p>
      )}
    </div>
  )
}
