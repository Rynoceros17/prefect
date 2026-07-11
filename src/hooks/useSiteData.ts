import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_SITE_DATA, STORAGE_KEY } from '../data/defaults'
import type { SiteData } from '../types'
import { migrateSiteData } from '../utils/migrateSiteData'
import { normalizeVideoRelease } from '../utils/videoRelease'

function loadSiteData(): SiteData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SITE_DATA

    const parsed = JSON.parse(stored) as Partial<SiteData>
    const migrated = migrateSiteData(parsed)
    const videos = (migrated.videos ?? DEFAULT_SITE_DATA.videos).map(normalizeVideoRelease)
    return { ...migrated, videos }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return DEFAULT_SITE_DATA
  }
}

export function useSiteData() {
  const [data, setData] = useState<SiteData>(loadSiteData)
  const [storageError, setStorageError] = useState<string | null>(null)
  const warnedRef = useRef(false)

  useEffect(() => {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(STORAGE_KEY, serialized)
      setStorageError(null)
      warnedRef.current = false
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'QuotaExceededError'
          ? 'Storage is full — try smaller images or fewer photos.'
          : 'Could not save changes locally.'
      setStorageError(message)
      if (!warnedRef.current) {
        warnedRef.current = true
        console.warn(message, err)
      }
    }
  }, [data])

  const updateData = useCallback((updater: (prev: SiteData) => SiteData) => {
    setData((prev) => updater(prev))
  }, [])

  const resetData = useCallback(() => {
    setData(DEFAULT_SITE_DATA)
    localStorage.removeItem(STORAGE_KEY)
    setStorageError(null)
  }, [])

  return { data, updateData, resetData, storageError }
}
