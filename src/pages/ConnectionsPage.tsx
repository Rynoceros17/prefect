import { useMemo } from 'react'
import { ConnectionsGame } from '../components/games/connections/ConnectionsGame'
import { ConnectionsPuzzleEditor } from '../components/games/connections/ConnectionsPuzzleEditor'
import { useEditMode } from '../context/EditModeContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import { normalizeConnectionsPuzzle } from '../utils/connectionsPuzzle'

export function ConnectionsPage() {
  const { data, updateData } = useSiteDataContext()
  const { isEditMode } = useEditMode()
  const puzzle = useMemo(
    () => normalizeConnectionsPuzzle(data.connectionsPuzzle),
    [data.connectionsPuzzle],
  )
  const puzzleKey = useMemo(
    () =>
      JSON.stringify({
        id: puzzle.id,
        number: puzzle.number,
        categories: puzzle.categories,
      }),
    [puzzle],
  )

  return (
    <div className="connections-page">
      {isEditMode && (
        <ConnectionsPuzzleEditor
          puzzle={puzzle}
          onChange={(connectionsPuzzle) => updateData((site) => ({ ...site, connectionsPuzzle }))}
        />
      )}

      {isEditMode && (
        <p className="connections-page__preview-note">Live preview below — exit edit mode to play.</p>
      )}

      <ConnectionsGame key={isEditMode ? puzzleKey : puzzle.id} puzzle={puzzle} previewOnly={isEditMode} />
    </div>
  )
}
