import type { ReactNode } from 'react'
import { SitePasswordGate } from '../components/SitePasswordGate'
import { useSiteAccess } from './SiteAccessContext'

export function SiteAccessGuard({ children }: { children: ReactNode }) {
  const { isUnlocked, isRequired } = useSiteAccess()

  if (isRequired && !isUnlocked) {
    return <SitePasswordGate />
  }

  return children
}
