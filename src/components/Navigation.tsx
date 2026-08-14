import { motion } from 'framer-motion'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEditMode } from '../context/EditModeContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import type { NavEmojis } from '../types'

type NavKey = keyof NavEmojis

const navItems: { to: string; label: string; key: NavKey }[] = [
  { to: '/journey', label: 'Our Journey', key: 'journey' },
  { to: '/', label: 'Homepage', key: 'homepage' },
  { to: '/theatre', label: 'Featured Prefect Videos', key: 'theatre' },
  { to: '/gallery', label: 'Gallery', key: 'gallery' },
  { to: '/games', label: 'Prefect Games', key: 'games' },
]

export function Navigation() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isEditMode } = useEditMode()
  const { data, updateData } = useSiteDataContext()
  const isTheatre = pathname === '/theatre'
  const isJourneyEdit = isEditMode && pathname === '/journey'

  const updateEmoji = (key: NavKey, value: string) => {
    updateData((d) => ({
      ...d,
      navEmojis: { ...d.navEmojis, [key]: value },
    }))
  }

  return (
    <div
      className={`sidebar-anchor ${isTheatre ? 'sidebar-anchor--bottom' : 'sidebar-anchor--left'} ${isJourneyEdit ? 'sidebar-anchor--journey-edit' : ''}`}
    >
      <motion.nav
        className={`sidebar ${isTheatre ? 'sidebar--theatre' : ''}`}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main navigation"
      >
        <div className="sidebar__track">
          {navItems.map((item) => {
            const isActive =
              item.to === '/games' ? pathname.startsWith('/games') : pathname === item.to

            if (isEditMode) {
              return (
                <div
                  key={item.to}
                  className={`sidebar__link sidebar__link--edit ${isActive ? 'sidebar__link--active' : ''}`}
                  title={item.label}
                >
                  <span className="sidebar__icon-wrap">
                    <input
                      className="sidebar__emoji-input"
                      value={data.navEmojis[item.key]}
                      onChange={(e) => updateEmoji(item.key, e.target.value)}
                      maxLength={8}
                      aria-label={`Emoji for ${item.label}`}
                    />
                    {isActive && <span className="sidebar__active-dot" />}
                  </span>
                  <button
                    type="button"
                    className="sidebar__label sidebar__label-nav"
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                  </button>
                </div>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={() => {
                  const active =
                    item.to === '/games' ? pathname.startsWith('/games') : pathname === item.to
                  return `sidebar__link ${active ? 'sidebar__link--active' : ''}`
                }}
                title={item.label}
              >
                <span className="sidebar__icon-wrap">
                  <span className="sidebar__emoji" role="img" aria-hidden>
                    {data.navEmojis[item.key]}
                  </span>
                  {isActive && <span className="sidebar__active-dot" />}
                </span>
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}
