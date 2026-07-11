import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useEditMode } from '../context/EditModeContext'
import { useScrollLock } from '../hooks/useScrollLock'
import { ModalPortal } from './ModalPortal'

export function PasswordModal() {
  const { showPasswordModal, closePasswordModal, attemptUnlock } = useEditMode()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)

  useScrollLock(showPasswordModal)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (attemptUnlock(password)) {
      setPassword('')
      setError(false)
      return
    }
    setError(true)
    setShake((s) => s + 1)
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="modal-overlay modal-overlay--locked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePasswordModal}
        >
          <motion.div
            className="password-modal"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            key={shake}
          >
            <motion.div
              className="password-modal__glow"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <div className="password-modal__content">
              <motion.div
                className="password-modal__icon"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔐
              </motion.div>
              <h2>Enter Editor Mode</h2>
              <p>Enter the secret password to unlock full editing capabilities.</p>
              <form onSubmit={handleSubmit}>
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  placeholder="Password"
                  className={`password-input ${error ? 'error' : ''}`}
                  autoFocus
                  animate={error ? { x: [-12, 12, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                />
                {error && (
                  <motion.p
                    className="password-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Incorrect password. Try again.
                  </motion.p>
                )}
                <div className="password-actions">
                  <button type="button" className="btn-ghost" onClick={closePasswordModal}>
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Unlock Editor
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  )
}
