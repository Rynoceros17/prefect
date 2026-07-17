import { useSiteDataContext } from '../context/SiteDataContext'

export function SyncStatus() {
  const {
    isFirebaseEnabled,
    isLoading,
    isSaving,
    syncError,
    storageError,
    saveSuccess,
  } = useSiteDataContext()

  if (!isFirebaseEnabled && !storageError) return null

  const message = syncError ?? storageError
  const tone = message ? 'error' : saveSuccess ? 'success' : isSaving ? 'saving' : isLoading ? 'loading' : 'idle'

  if (tone === 'idle') return null

  const label =
    message ??
    (saveSuccess
      ? 'Saved to cloud!'
      : isSaving
        ? 'Saving to cloud…'
        : isLoading
          ? 'Loading site data…'
          : null)

  if (!label) return null

  return (
    <div className={`sync-status sync-status--${tone}`} role="status" aria-live="polite">
      {label}
    </div>
  )
}
