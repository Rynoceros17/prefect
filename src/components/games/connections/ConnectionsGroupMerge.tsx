import { useEffect, useState, type CSSProperties } from 'react'
import type { ConnectionsCategory } from '../../../types/connections'
import { CONNECTIONS_DIFFICULTY_COLORS } from '../../../types/connections'

export interface MergeRect {
  left: number
  top: number
  width: number
  height: number
}

export interface MergingGroup {
  category: ConnectionsCategory
  words: string[]
  rects: MergeRect[]
  target: MergeRect
}

interface ConnectionsGroupMergeProps {
  group: MergingGroup
  onComplete: () => void
}

const CLUSTER_MS = 260
const BAR_MS = 420
const MERGE_MS = CLUSTER_MS + BAR_MS

export function ConnectionsGroupMerge({ group, onComplete }: ConnectionsGroupMergeProps) {
  const [phase, setPhase] = useState<'start' | 'cluster' | 'bar'>('start')
  const color = CONNECTIONS_DIFFICULTY_COLORS[group.category.difficulty]
  const clusterSize = Math.min(group.target.height * 0.72, 56)
  const clusterCenterX = group.target.left + group.target.width / 2
  const clusterCenterY = group.target.top + group.target.height / 2

  useEffect(() => {
    const clusterFrame = requestAnimationFrame(() => setPhase('cluster'))
    const barTimer = window.setTimeout(() => setPhase('bar'), CLUSTER_MS)
    const completeTimer = window.setTimeout(onComplete, MERGE_MS)

    return () => {
      cancelAnimationFrame(clusterFrame)
      window.clearTimeout(barTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  const phaseClass =
    phase === 'bar'
      ? 'connections-merge--bar'
      : phase === 'cluster'
        ? 'connections-merge--cluster'
        : ''

  return (
    <div className={`connections-merge ${phaseClass}`}>
      {group.words.map((word, index) => {
        const start = group.rects[index]
        const stackOffset = (index - 1.5) * 5
        const clusterLeft = clusterCenterX - clusterSize / 2 + stackOffset
        const clusterTop = clusterCenterY - clusterSize / 2
        return (
          <div
            key={word}
            className="connections-merge-chip"
            style={
              {
                '--start-x': `${start.left}px`,
                '--start-y': `${start.top}px`,
                '--start-w': `${start.width}px`,
                '--start-h': `${start.height}px`,
                '--cluster-x': `${clusterLeft}px`,
                '--cluster-y': `${clusterTop}px`,
                '--cluster-w': `${clusterSize}px`,
                '--cluster-h': `${clusterSize}px`,
                '--chip-color': color,
                '--delay': `${index * 28}ms`,
                zIndex: index + 1,
              } as CSSProperties
            }
          >
            <span className="connections-merge-chip__label">{word}</span>
          </div>
        )
      })}
      <div
        className="connections-merge-bar"
        style={
          {
            left: group.target.left,
            top: group.target.top,
            width: group.target.width,
            height: group.target.height,
            backgroundColor: color,
          } as CSSProperties
        }
      >
        <span className="connections-solved__title">{group.category.title}</span>
        <span className="connections-solved__words">{group.words.join(', ')}</span>
      </div>
    </div>
  )
}
