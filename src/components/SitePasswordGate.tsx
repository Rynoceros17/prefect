import { motion } from 'framer-motion'
import { useState } from 'react'
import { useSiteAccess } from '../context/SiteAccessContext'
import { useScrollLock } from '../hooks/useScrollLock'

export function SitePasswordGate() {
  const { attemptUnlock } = useSiteAccess()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)

  useScrollLock(true)

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
    <div className="site-password-gate">
      <motion.div
        className="password-modal site-password-gate__card"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
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
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔒
          </motion.div>
          <h2>Prefect Gallery</h2>
          <p>Enter the password to view this site.</p>
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
              autoComplete="current-password"
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
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enter
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
