import { useEffect, useState } from 'react'
import { galleryColumnCount } from '../utils/galleryMasonry'

export function useGalleryColumnCount(): number {
  const [count, setCount] = useState(() =>
    typeof window !== 'undefined' ? galleryColumnCount(window.innerWidth) : 3,
  )

  useEffect(() => {
    const update = () => setCount(galleryColumnCount(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}
