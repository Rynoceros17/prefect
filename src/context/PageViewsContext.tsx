import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { isFirebaseConfigured } from '../lib/firebase'
import {
  ensurePageViewBaseline,
  getPageViewCount,
  recordPageViewOnce,
  subscribePageViewCount,
} from '../services/pageViewService'

interface PageViewsContextValue {
  totalViews: number
}

const PageViewsContext = createContext<PageViewsContextValue>({ totalViews: 0 })

export function PageViewsProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [totalViews, setTotalViews] = useState(0)

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    void (async () => {
      await ensurePageViewBaseline()
      if (cancelled) return
      unsubscribe = subscribePageViewCount(setTotalViews)
    })()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void recordPageViewOnce(location.pathname, location.search).then(() => {
      if (cancelled || isFirebaseConfigured()) return
      setTotalViews(getPageViewCount())
    })

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.search])

  return (
    <PageViewsContext.Provider value={{ totalViews }}>{children}</PageViewsContext.Provider>
  )
}

export function usePageViews() {
  return useContext(PageViewsContext)
}
