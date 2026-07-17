import { createPortal } from 'react-dom'
import { useDraggablePanel, type PanelPosition } from '../../hooks/useDraggablePanel'

interface DraggableEditorPanelProps {
  id: string
  className?: string
  defaultPosition: () => PanelPosition
  zIndex?: number
  children: React.ReactNode
}

export function DraggableEditorPanel({
  id,
  className = '',
  defaultPosition,
  zIndex = 115,
  children,
}: DraggableEditorPanelProps) {
  const { position, onMoveStart } = useDraggablePanel(id, defaultPosition)

  return createPortal(
    <div
      className={`draggable-editor-panel ${className}`.trim()}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="draggable-editor-panel__move"
        onPointerDown={onMoveStart}
        aria-label="Move panel"
        title="Drag to move"
      >
        ⠿
      </button>
      <div className="draggable-editor-panel__body">{children}</div>
    </div>,
    document.body,
  )
}

export function defaultPlanetToolsPosition(): PanelPosition {
  return { x: 16, y: 88 }
}

export function defaultPinboardToolbarPosition(): PanelPosition {
  return { x: Math.max(88, window.innerWidth * 0.5 - 220), y: 16 }
}

export function defaultPinInspectorPosition(): PanelPosition {
  return { x: Math.max(16, window.innerWidth - 460), y: Math.max(16, window.innerHeight - 340) }
}

export function defaultTextFormatToolbarPosition(): PanelPosition {
  return { x: Math.max(16, window.innerWidth * 0.5 - 180), y: 72 }
}

export function defaultEditBarPosition(): PanelPosition {
  return { x: Math.max(16, window.innerWidth * 0.5 - 160), y: Math.max(16, window.innerHeight - 72) }
}
