import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_SITE_DATA, STORAGE_KEY } from '../data/defaults'
import { isFirebaseConfigured } from '../lib/firebase'
import { fetchSiteData, saveSiteData, subscribeSiteData } from '../services/siteDataService'
import type { SiteData } from '../types'
import { migrateSiteData } from '../utils/migrateSiteData'
import { normalizeVideoRelease } from '../utils/videoRelease'

function loadLocalSiteData(): SiteData {
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

function cacheSiteDataLocally(data: SiteData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return null
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'QuotaExceededError'
        ? 'Storage is full — try smaller images or fewer photos.'
        : 'Could not save changes locally.'
    return message
  }
}

function snapshotData(data: SiteData): string {
  return JSON.stringify(data)
}

export function useSiteData() {
  const firebaseEnabled = isFirebaseConfigured()
  const [data, setData] = useState<SiteData>(loadLocalSiteData)
  const [isLoading, setIsLoading] = useState(firebaseEnabled)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const dataRef = useRef(data)
  const lastSavedSnapshotRef = useRef<string | null>(null)
  const lastSavedAtRef = useRef(0)
  const saveInFlightRef = useRef(false)
  const readyToSaveRef = useRef(!firebaseEnabled)
  const warnedRef = useRef(false)
  const saveSuccessTimerRef = useRef<number | null>(null)

  dataRef.current = data

  const markSaved = useCallback((next: SiteData) => {
    lastSavedSnapshotRef.current = snapshotData(next)
    setHasUnsavedChanges(false)
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return

    let cancelled = false

    fetchSiteData()
      .then((remote) => {
        if (cancelled) return
        const next = remote ?? loadLocalSiteData()
        setData(next)
        cacheSiteDataLocally(next)
        markSaved(next)
        setSyncError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setSyncError(err instanceof Error ? err.message : 'Could not load site data.')
        const local = loadLocalSiteData()
        setData(local)
        markSaved(local)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
          readyToSaveRef.current = true
        }
      })

    const unsubscribeData = subscribeSiteData(
      (remote, updatedAtMs) => {
        if (updatedAtMs <= lastSavedAtRef.current) return
        if (saveInFlightRef.current) return
        setData(remote)
        cacheSiteDataLocally(remote)
        markSaved(remote)
      },
      (message) => setSyncError(message),
    )

    return () => {
      cancelled = true
      unsubscribeData()
    }
  }, [firebaseEnabled, markSaved])

  useEffect(() => {
    const localError = cacheSiteDataLocally(data)
    if (localError) {
      setStorageError(localError)
      if (!warnedRef.current) {
        warnedRef.current = true
        console.warn(localError)
      }
    } else {
      setStorageError(null)
      warnedRef.current = false
    }

    if (!firebaseEnabled || !readyToSaveRef.current || lastSavedSnapshotRef.current === null) return
    setHasUnsavedChanges(snapshotData(data) !== lastSavedSnapshotRef.current)
  }, [data, firebaseEnabled])

  useEffect(() => {
    return () => {
      if (saveSuccessTimerRef.current) window.clearTimeout(saveSuccessTimerRef.current)
    }
  }, [])

  const saveToCloud = useCallback(async (): Promise<boolean> => {
    if (!firebaseEnabled || !readyToSaveRef.current || saveInFlightRef.current) return false

    const snapshot = dataRef.current
    saveInFlightRef.current = true
    setIsSaving(true)
    setSyncError(null)
    setSaveSuccess(false)

    try {
      const { updatedAtMs, content } = await saveSiteData(snapshot)
      lastSavedAtRef.current = updatedAtMs
      setData(content)
      cacheSiteDataLocally(content)
      markSaved(content)
      setStorageError(null)
      warnedRef.current = false
      setSaveSuccess(true)
      if (saveSuccessTimerRef.current) window.clearTimeout(saveSuccessTimerRef.current)
      saveSuccessTimerRef.current = window.setTimeout(() => setSaveSuccess(false), 2500)
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save changes to Firebase.'
      setSyncError(message)
      console.warn(message, err)
      return false
    } finally {
      saveInFlightRef.current = false
      setIsSaving(false)
    }
  }, [firebaseEnabled, markSaved])

  const updateData = useCallback((updater: (prev: SiteData) => SiteData) => {
    setData((prev) => updater(prev))
  }, [])

  const resetData = useCallback(() => {
    setData(DEFAULT_SITE_DATA)
    localStorage.removeItem(STORAGE_KEY)
    setStorageError(null)
  }, [])

  return {
    data,
    updateData,
    resetData,
    saveToCloud,
    storageError,
    syncError,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    saveSuccess,
    isFirebaseEnabled: firebaseEnabled,
  }
}
