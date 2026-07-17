import { motion } from 'framer-motion'
import { useEditMode } from '../context/EditModeContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import { IconClose, IconEdit } from './icons/NavIcons'

export function EditModeBubble() {
  const { isEditMode, openPasswordModal, exitEditMode } = useEditMode()
  const {
    isFirebaseEnabled,
    hasUnsavedChanges,
    isSaving,
    saveToCloud,
  } = useSiteDataContext()

  const handleExit = () => {
    if (isFirebaseEnabled && hasUnsavedChanges) {
      const leave = window.confirm(
        'You have unsaved changes. Exit edit mode without saving to the cloud?',
      )
      if (!leave) return
    }
    exitEditMode()
  }

  const handleSave = () => {
    void saveToCloud()
  }

  return (
    <div className="edit-dock">
      {isEditMode && isFirebaseEnabled && (
        <motion.button
          type="button"
          className={`cloud-save-btn ${hasUnsavedChanges ? 'cloud-save-btn--dirty' : ''}`}
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={hasUnsavedChanges && !isSaving ? { scale: 1.03 } : undefined}
          whileTap={hasUnsavedChanges && !isSaving ? { scale: 0.97 } : undefined}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </motion.button>
      )}

      <motion.button
        type="button"
        className={`edit-bubble ${isEditMode ? 'edit-bubble--active' : ''}`}
        onClick={isEditMode ? handleExit : openPasswordModal}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.4 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
        title={isEditMode ? 'Exit edit mode' : 'Edit mode'}
      >
        {isEditMode ? (
          <>
            <IconClose className="edit-bubble__icon" />
            <span className="edit-bubble__label">Exit</span>
          </>
        ) : (
          <>
            <IconEdit className="edit-bubble__icon" />
            <span className="edit-bubble__label">Edit</span>
          </>
        )}
        {isEditMode && <span className="edit-bubble__pulse" />}
      </motion.button>
    </div>
  )
}
