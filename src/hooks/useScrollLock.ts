import { useEffect } from 'react'

/** Locks page scroll, scrolls viewport to top, and restores position on cleanup. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const scrollY = window.scrollY
    window.scrollTo(0, 0)

    const { body } = document
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = '0'
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      body.style.overflow = prev.overflow
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [active])
}
