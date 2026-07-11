import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ModalPortal } from '../ModalPortal'
import { useScrollLock } from '../../hooks/useScrollLock'
import type { LeaderProfile } from '../../types'
import { processImageFile } from '../../utils/images'
import { LEADERSHIP_ROLES, roleToSlug } from '../../utils/leaders'

interface LeaderModalProps {
  leader: LeaderProfile | null
  onClose: () => void
  isEditMode: boolean
  onSave: (leader: LeaderProfile) => void
  onDelete?: () => void
}

export function LeaderModal({ leader, onClose, isEditMode, onSave, onDelete }: LeaderModalProps) {
  const [draft, setDraft] = useState<LeaderProfile | null>(leader)

  useScrollLock(!!leader)

  useEffect(() => {
    setDraft(leader)
  }, [leader])

  if (!leader || !draft) return null

  const handleImageUpload =
    (field: 'profilePicUrl' | 'largeImageUrl', maxSize: number) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const dataUrl = await processImageFile(file, {
          maxWidth: maxSize,
          maxHeight: maxSize,
        })
        setDraft((current) => (current ? { ...current, [field]: dataUrl } : current))
      } catch {
        window.alert('Could not process that image. Try a smaller file.')
      }
      e.target.value = ''
    }

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          className="modal-overlay modal-overlay--locked modal-overlay--leader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      >
        <motion.div
          className={`leader-modal leader-modal--${roleToSlug(draft.role)} ${isEditMode ? 'leader-modal--editing' : ''}`}
          initial={{ opacity: 0, scale: 0.7, rotateX: 15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{ perspective: 1000 }}
        >
          <motion.button className="modal-close" onClick={onClose} whileHover={{ rotate: 90 }}>
            ×
          </motion.button>

          <div className="leader-modal__layout">
            <motion.div
              className="leader-modal__visual"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="leader-modal__large-wrap">
                <img
                  src={draft.largeImageUrl}
                  alt={draft.name}
                  className="leader-modal__large-image"
                />
                {isEditMode && (
                  <label className="image-upload-overlay">
                    Change large photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload('largeImageUrl', 1200)}
                    />
                  </label>
                )}
              </div>

              <div className="leader-modal__profile-wrap">
                <img
                  src={draft.profilePicUrl}
                  alt=""
                  className="leader-modal__profile-image"
                />
                {isEditMode && (
                  <label className="leader-modal__profile-upload">
                    Change profile
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload('profilePicUrl', 600)}
                    />
                  </label>
                )}
              </div>
            </motion.div>

            <div className="leader-modal__info">
              {isEditMode ? (
                <>
                  <input
                    className="edit-input edit-input--title"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                  <label className="leader-modal__field-label">
                    Leadership role
                    <select
                      className="edit-input"
                      value={draft.role}
                      onChange={(e) =>
                        setDraft({ ...draft, role: e.target.value as LeaderProfile['role'] })
                      }
                    >
                      {LEADERSHIP_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <textarea
                    className="edit-textarea"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={4}
                    placeholder="Description"
                  />
                  <input
                    className="edit-input"
                    value={draft.profilePicUrl}
                    onChange={(e) => setDraft({ ...draft, profilePicUrl: e.target.value })}
                    placeholder="Profile picture URL"
                  />
                  <input
                    className="edit-input"
                    value={draft.largeImageUrl}
                    onChange={(e) => setDraft({ ...draft, largeImageUrl: e.target.value })}
                    placeholder="Large image URL"
                  />
                  <motion.button
                    className="btn-primary"
                    onClick={() => onSave(draft)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Save Changes
                  </motion.button>
                  {onDelete && (
                    <motion.button
                      className="btn-danger"
                      onClick={onDelete}
                      style={{ width: '100%' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete Leader
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  <span className={`leader-modal__role-badge leader-modal__role-badge--${roleToSlug(draft.role)}`}>
                    {draft.role}
                  </span>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {draft.name}
                  </motion.h2>
                  <motion.div className="leader-modal__divider" />
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {draft.description}
                  </motion.p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      </AnimatePresence>
    </ModalPortal>
  )
}
