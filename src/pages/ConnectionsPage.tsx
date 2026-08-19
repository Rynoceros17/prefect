import { useMemo } from 'react'
import { GamesLeaderboard } from '../components/games/GamesLeaderboard'
import { GamesSignInLock } from '../components/games/GamesSignIn'
import { ConnectionsGame } from '../components/games/connections/ConnectionsGame'
import { ConnectionsPuzzleEditor } from '../components/games/connections/ConnectionsPuzzleEditor'
import { useEditMode } from '../context/EditModeContext'
import { useGamesPlayer } from '../context/GamesPlayerContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import { normalizeConnectionsPuzzle } from '../utils/connectionsPuzzle'

export function ConnectionsPage() {
  const { data, updateData } = useSiteDataContext()
  const { isEditMode } = useEditMode()
  const { player, recordPuzzleSolve } = useGamesPlayer()
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

  const signedIn = Boolean(player)
  const gameLocked = !isEditMode && !signedIn

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

      <GamesSignInLock locked={gameLocked}>
        <ConnectionsGame
          key={isEditMode ? puzzleKey : puzzle.id}
          puzzle={puzzle}
          previewOnly={isEditMode}
          canPlay={signedIn && !isEditMode}
          onPuzzleSolved={recordPuzzleSolve}
        />
      </GamesSignInLock>

      {!isEditMode && signedIn && <GamesLeaderboard />}
    </div>
  )
}
