import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navigation } from './Navigation'
import { EditModeBubble } from './EditModeBubble'
import { PasswordModal } from './PasswordModal'

const pageVariants = {
  initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
}

export function Layout() {
  const location = useLocation()
  const isGallery = location.pathname === '/gallery'
  const isHomepage = location.pathname === '/'

  useEffect(() => {
    document.body.classList.toggle('body--gallery', isGallery)
    document.body.classList.toggle('body--homepage', isHomepage)
    return () => {
      document.body.classList.remove('body--gallery')
      document.body.classList.remove('body--homepage')
    }
  }, [isGallery, isHomepage])

  return (
    <div className={`app ${isGallery ? 'app--gallery' : ''} ${isHomepage ? 'app--homepage' : ''}`}>
      <div className="app__bg">
        <div className="app__bg-orb app__bg-orb--1" />
        <div className="app__bg-orb app__bg-orb--2" />
        <div className="app__bg-orb app__bg-orb--3" />
        <div className="app__bg-grid" />
      </div>

      <Navigation />
      <EditModeBubble />
      <PasswordModal />

      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isGallery && (
        <footer className="footer">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Leadership Body © {new Date().getFullYear()}
          </motion.p>
        </footer>
      )}
    </div>
  )
}
