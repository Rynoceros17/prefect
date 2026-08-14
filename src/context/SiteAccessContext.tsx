import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSitePasswordRequired, SITE_PASSWORD } from '../config/siteAccess'

interface SiteAccessContextValue {
  isUnlocked: boolean
  isRequired: boolean
  attemptUnlock: (password: string) => boolean
}

const SiteAccessContext = createContext<SiteAccessContextValue | null>(null)

const STORAGE_KEY = 'leadership-site-access'

export function SiteAccessProvider({ children }: { children: ReactNode }) {
  const isRequired = isSitePasswordRequired()
  const [isUnlocked, setIsUnlocked] = useState(
    () => !isRequired || sessionStorage.getItem(STORAGE_KEY) === 'true',
  )

  const attemptUnlock = useCallback((password: string) => {
    if (!isRequired || password !== SITE_PASSWORD) return false
    setIsUnlocked(true)
    sessionStorage.setItem(STORAGE_KEY, 'true')
    return true
  }, [isRequired])

  const value = useMemo(
    () => ({
      isUnlocked,
      isRequired,
      attemptUnlock,
    }),
    [isUnlocked, isRequired, attemptUnlock],
  )

  return <SiteAccessContext.Provider value={value}>{children}</SiteAccessContext.Provider>
}

export function useSiteAccess() {
  const ctx = useContext(SiteAccessContext)
  if (!ctx) throw new Error('useSiteAccess must be used within SiteAccessProvider')
  return ctx
}
