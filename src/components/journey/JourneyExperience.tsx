import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditMode } from '../../context/EditModeContext'
import type { JourneyData, JourneyPlanetPage } from '../../types'
import { createPlanetPage } from '../../utils/journey'
import { JourneyNav } from './JourneyNav'
import { JourneyRocket, type RocketState } from './JourneyRocket'
import { JourneyStarfield } from './JourneyStarfield'
import { JourneyStopSection } from './JourneyStopSection'
import {
  DraggableEditorPanel,
  defaultEditBarPosition,
} from './DraggableEditorPanel'

interface JourneyExperienceProps {
  journey: JourneyData
  onChange: (journey: JourneyData) => void
}

const UP_MS = 2700
const DOWN_MS = 3100

function syncLaunchFields(earth: JourneyPlanetPage, journey: JourneyData) {
  const titleBlock = earth.blocks.find((b) => b.type === 'text' && b.variant === 'gold-title')
  const introBlock = earth.blocks.find(
    (b) => b.type === 'text' && b.variant !== 'gold-title' && b.content.trim(),
  )
  return {
    ...journey,
    earth,
    launchTitle: titleBlock?.type === 'text' ? titleBlock.content : journey.launchTitle,
    launchIntro: introBlock?.type === 'text' ? introBlock.content : journey.launchIntro,
  }
}

export function JourneyExperience({ journey, onChange }: JourneyExperienceProps) {
  const { isEditMode } = useEditMode()
  const totalPages = 1 + journey.planets.length
  const [pageIndex, setPageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rocketState, setRocketState] = useState<RocketState>('idle')
  const [flightDirection, setFlightDirection] = useState<1 | -1>(1)
  const timersRef = useRef<number[]>([])

  const worldY = `-${(totalPages - 1 - pageIndex) * 100}vh`
  const flightMs = flightDirection > 0 ? UP_MS : DOWN_MS

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const next = pageIndex + dir
      if (next < 0 || next >= totalPages || isTransitioning) return

      clearTimers()
      setFlightDirection(dir)
      setIsTransitioning(true)
      setRocketState('boost')

      const duration = dir > 0 ? UP_MS : DOWN_MS

      schedule(() => setRocketState('flying'), dir > 0 ? 400 : 580)
      schedule(() => {
        setPageIndex(next)
        setRocketState('approach')
      }, duration * (dir > 0 ? 0.6 : 0.58))
      schedule(() => setRocketState('landing'), duration * (dir > 0 ? 0.76 : 0.78))
      schedule(() => {
        setRocketState(next === 0 ? 'idle' : 'landed')
        setIsTransitioning(false)
      }, duration)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageIndex, totalPages, isTransitioning],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      e.preventDefault()
      if (e.key === 'ArrowUp') navigate(1)
      else navigate(-1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  const updateEarth = (earth: JourneyPlanetPage) => {
    onChange(syncLaunchFields(earth, journey))
  }

  const updatePlanet = (index: number, planet: JourneyPlanetPage) => {
    onChange({
      ...journey,
      planets: journey.planets.map((p, i) => (i === index ? planet : p)),
    })
  }

  const addPlanet = () => {
    onChange({ ...journey, planets: [...journey.planets, createPlanetPage()] })
  }

  const deletePlanet = (index: number) => {
    const planets = journey.planets.filter((_, i) => i !== index)
    onChange({ ...journey, planets })
    if (pageIndex === index + 1) setPageIndex(Math.max(0, pageIndex - 1))
    else if (pageIndex > index + 1) setPageIndex(pageIndex - 1)
  }

  const stopName =
    pageIndex === 0 ? journey.earth.name : (journey.planets[pageIndex - 1]?.name ?? 'Planet')

  const isLanded = (active: boolean) =>
    active &&
    (rocketState === 'landed' || rocketState === 'landing' || rocketState === 'idle')

  return (
    <div className="journey-experience">
      <JourneyStarfield
        flying={rocketState === 'flying' || rocketState === 'boost'}
        direction={flightDirection}
      />

      <motion.div
        className="journey-experience__world"
        initial={false}
        animate={{ y: worldY }}
        transition={{
          duration: isTransitioning ? flightMs / 1000 : 0,
          ease: flightDirection > 0 ? [0.45, 0.02, 0.12, 1] : [0.3, 0.12, 0.25, 1],
        }}
      >
        {[...journey.planets].reverse().map((planet, reverseIndex) => {
          const index = journey.planets.length - 1 - reverseIndex
          const active = pageIndex === index + 1
          return (
            <JourneyStopSection
              key={planet.id}
              planet={planet}
              active={active}
              isEditMode={isEditMode}
              landed={isLanded(active)}
              onChange={(updated) => updatePlanet(index, updated)}
              onDelete={journey.planets.length > 1 ? () => deletePlanet(index) : undefined}
            />
          )
        })}

        <JourneyStopSection
          planet={journey.earth}
          active={pageIndex === 0}
          isEditMode={isEditMode}
          landed={isLanded(pageIndex === 0)}
          onChange={updateEarth}
        />
      </motion.div>

      <div className="journey-experience__rocket-layer">
        <JourneyRocket state={rocketState} direction={flightDirection} />
      </div>

      <JourneyNav
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        disabled={isTransitioning}
      />

      {isEditMode && (
        <DraggableEditorPanel
          id="journey-edit-bar"
          className="journey-experience__edit-bar-wrap"
          defaultPosition={defaultEditBarPosition}
          zIndex={118}
        >
          <div className="journey-experience__edit-bar">
            <button type="button" className="btn-primary btn-small" onClick={addPlanet}>
              + Add journey stop
            </button>
            <span className="journey-experience__edit-hint">
              Stop {pageIndex + 1} of {totalPages} · {stopName}
            </span>
          </div>
        </DraggableEditorPanel>
      )}
    </div>
  )
}
