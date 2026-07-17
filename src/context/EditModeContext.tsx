import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { EDITOR_PASSWORD } from '../config/editor'

interface EditModeContextValue {
  isEditMode: boolean
  showPasswordModal: boolean
  openPasswordModal: () => void
  closePasswordModal: () => void
  attemptUnlock: (password: string) => boolean
  exitEditMode: () => void
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(
    () => sessionStorage.getItem('leadership-edit-mode') === 'true',
  )
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const openPasswordModal = useCallback(() => setShowPasswordModal(true), [])
  const closePasswordModal = useCallback(() => setShowPasswordModal(false), [])

  const attemptUnlock = useCallback((password: string) => {
    if (!EDITOR_PASSWORD || password !== EDITOR_PASSWORD) return false
    setIsEditMode(true)
    sessionStorage.setItem('leadership-edit-mode', 'true')
    setShowPasswordModal(false)
    return true
  }, [])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    sessionStorage.removeItem('leadership-edit-mode')
  }, [])

  const value = useMemo(
    () => ({
      isEditMode,
      showPasswordModal,
      openPasswordModal,
      closePasswordModal,
      attemptUnlock,
      exitEditMode,
    }),
    [
      isEditMode,
      showPasswordModal,
      openPasswordModal,
      closePasswordModal,
      attemptUnlock,
      exitEditMode,
    ],
  )

  return (
    <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
  )
}

export function useEditMode() {
  const ctx = useContext(EditModeContext)
  if (!ctx) throw new Error('useEditMode must be used within EditModeProvider')
  return ctx
}
