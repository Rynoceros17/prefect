import { motion } from 'framer-motion'
import { useEditMode } from '../context/EditModeContext'
import { IconClose, IconEdit } from './icons/NavIcons'

export function EditModeBubble() {
  const { isEditMode, openPasswordModal, exitEditMode } = useEditMode()

  return (
    <motion.button
      type="button"
      className={`edit-bubble ${isEditMode ? 'edit-bubble--active' : ''}`}
      onClick={isEditMode ? exitEditMode : openPasswordModal}
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
  )
}
