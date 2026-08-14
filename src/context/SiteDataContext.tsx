import { createContext, useContext, type ReactNode } from 'react'
import { useSiteData } from '../hooks/useSiteData'
import type { SiteData } from '../types'

interface SiteDataContextValue {
  data: SiteData
  updateData: (updater: (prev: SiteData) => SiteData) => void
  updatePostLike: (postId: string, delta: number) => Promise<boolean>
  resetData: () => void
  saveToCloud: () => Promise<boolean>
  storageError: string | null
  syncError: string | null
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  saveSuccess: boolean
  isFirebaseEnabled: boolean
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null)

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const siteData = useSiteData()
  return (
    <SiteDataContext.Provider value={siteData}>{children}</SiteDataContext.Provider>
  )
}

export function useSiteDataContext() {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteDataContext must be used within SiteDataProvider')
  return ctx
}
