interface JourneyPlanetControlsProps {
  planetY: number
  planetSize: number
  onPlanetYChange: (y: number) => void
  onPlanetSizeChange: (size: number) => void
  name?: string
  planetColor?: string
  planetType?: string
  onNameChange?: (name: string) => void
  onColorChange?: (color: string) => void
  onTypeChange?: (type: string) => void
  typeOptions?: { value: string; label: string }[]
  onDelete?: () => void
}

export function JourneyPlanetControls({
  planetY,
  planetSize,
  onPlanetYChange,
  onPlanetSizeChange,
  name,
  planetColor,
  planetType,
  onNameChange,
  onColorChange,
  onTypeChange,
  typeOptions,
  onDelete,
}: JourneyPlanetControlsProps) {
  return (
    <div
      className="journey-editor-panel"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className="edit-input"
        value={name ?? ''}
        onChange={(e) => onNameChange?.(e.target.value)}
        placeholder="Planet name"
      />
      <label className="journey-editor-panel__field">
        Colour
        <input
          type="color"
          value={planetColor ?? '#7b5cff'}
          onChange={(e) => onColorChange?.(e.target.value)}
        />
      </label>
      <label className="journey-editor-panel__field">
        Type
        <select
          className="edit-input"
          value={planetType ?? 'rocky'}
          onChange={(e) => onTypeChange?.(e.target.value)}
        >
          {typeOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="journey-editor-panel__field">
        Vertical position ({Math.round(planetY)}%)
        <input
          type="range"
          min={5}
          max={95}
          step={1}
          value={planetY}
          onChange={(e) => onPlanetYChange(Number(e.target.value))}
        />
      </label>
      <label className="journey-editor-panel__field">
        Size ({planetSize.toFixed(1)}×)
        <input
          type="number"
          className="edit-input"
          min={0.1}
          step={0.1}
          value={planetSize}
          onChange={(e) => {
            const next = parseFloat(e.target.value)
            if (Number.isFinite(next) && next > 0) onPlanetSizeChange(next)
          }}
        />
      </label>
      {onDelete && (
        <button type="button" className="btn-danger btn-small" onClick={onDelete}>
          Delete this stop
        </button>
      )}
    </div>
  )
}
