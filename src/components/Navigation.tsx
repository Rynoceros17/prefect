import { motion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { useEditMode } from '../context/EditModeContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import type { NavEmojis } from '../types'

type NavKey = keyof NavEmojis

const navItems: { to: string; label: string; key: NavKey }[] = [
  { to: '/', label: 'Homepage', key: 'homepage' },
  { to: '/theatre', label: 'Featured Prefect Videos', key: 'theatre' },
  { to: '/gallery', label: 'Gallery', key: 'gallery' },
]

export function Navigation() {
  const { pathname } = useLocation()
  const { isEditMode } = useEditMode()
  const { data, updateData } = useSiteDataContext()
  const isTheatre = pathname === '/theatre'

  const updateEmoji = (key: NavKey, value: string) => {
    updateData((d) => ({
      ...d,
      navEmojis: { ...d.navEmojis, [key]: value },
    }))
  }

  return (
    <div
      className={`sidebar-anchor ${isTheatre ? 'sidebar-anchor--bottom' : 'sidebar-anchor--left'}`}
    >
      <motion.nav
        className={`sidebar ${isTheatre ? 'sidebar--theatre' : ''}`}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main navigation"
      >
        <div className="sidebar__track">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              title={item.label}
            >
              {({ isActive }) => (
                <>
                  <span className="sidebar__icon-wrap">
                    {isEditMode ? (
                      <input
                        className="sidebar__emoji-input"
                        value={data.navEmojis[item.key]}
                        onChange={(e) => updateEmoji(item.key, e.target.value)}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        maxLength={4}
                        aria-label={`Emoji for ${item.label}`}
                      />
                    ) : (
                      <span className="sidebar__emoji" role="img" aria-hidden>
                        {data.navEmojis[item.key]}
                      </span>
                    )}
                    {isActive && <span className="sidebar__active-dot" />}
                  </span>
                  <span className="sidebar__label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </div>
  )
}
