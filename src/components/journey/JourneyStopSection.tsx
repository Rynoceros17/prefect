import type { JourneyPlanetPage } from '../../types'
import { JOURNEY_PLANET_TYPES } from '../../utils/journey'
import { JourneyPinboard } from './JourneyPinboard'
import { JourneyPlanet } from './JourneyPlanet'
import { JourneyPlanetControls } from './JourneyPlanetControls'
import { JourneyPlanetPlacement } from './JourneyPlanetPlacement'
import { DraggableEditorPanel, defaultPlanetToolsPosition } from './DraggableEditorPanel'

interface JourneyStopSectionProps {
  planet: JourneyPlanetPage
  active: boolean
  isEditMode: boolean
  landed: boolean
  onChange: (planet: JourneyPlanetPage) => void
  onDelete?: () => void
}

export function JourneyStopSection({
  planet,
  active,
  isEditMode,
  landed,
  onChange,
  onDelete,
}: JourneyStopSectionProps) {
  const editing = isEditMode && active

  return (
    <section className="journey-section journey-section--planet">
      <JourneyPlanetPlacement
        planetY={planet.planetY}
        isEditMode={editing}
        onPlanetYChange={editing ? (planetY) => onChange({ ...planet, planetY }) : undefined}
      >
        <JourneyPlanet
          name={planet.name}
          color={planet.planetColor}
          size={planet.planetSize}
          type={planet.planetType}
          landed={landed}
          isActive={active}
        />
      </JourneyPlanetPlacement>

      <JourneyPinboard
        blocks={planet.blocks}
        onChange={(blocks) => onChange({ ...planet, blocks })}
        isEditMode={editing}
        fullscreen
      />

      {editing && (
        <DraggableEditorPanel
          id="journey-planet-tools"
          className="journey-section__planet-tools"
          defaultPosition={defaultPlanetToolsPosition}
          zIndex={116}
        >
          <JourneyPlanetControls
            planetY={planet.planetY}
            planetSize={planet.planetSize}
            onPlanetYChange={(planetY) => onChange({ ...planet, planetY })}
            onPlanetSizeChange={(planetSize) => onChange({ ...planet, planetSize })}
            name={planet.name}
            planetColor={planet.planetColor}
            planetType={planet.planetType}
            onNameChange={(name) => onChange({ ...planet, name })}
            onColorChange={(planetColor) => onChange({ ...planet, planetColor })}
            onTypeChange={(planetType) =>
              onChange({ ...planet, planetType: planetType as JourneyPlanetPage['planetType'] })
            }
            typeOptions={JOURNEY_PLANET_TYPES}
            onDelete={onDelete}
          />
        </DraggableEditorPanel>
      )}
    </section>
  )
}
