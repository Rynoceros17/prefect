import type { JourneyBlock, SiteData } from '../types'

function addJourneyBlockUrls(block: JourneyBlock, urls: Set<string>): void {
  if (block.type === 'image' && block.imageUrl) {
    urls.add(block.imageUrl)
  } else if (block.type === 'carousel') {
    block.images.forEach((url) => {
      if (url) urls.add(url)
    })
  }
}

/** Collect every image URL referenced in site data (excluding empty strings). */
export function collectSiteImageUrls(data: SiteData): Set<string> {
  const urls = new Set<string>()

  data.teamCarouselImages.forEach((url) => {
    if (url) urls.add(url)
  })

  data.leaders.forEach((leader) => {
    if (leader.profilePicUrl) urls.add(leader.profilePicUrl)
    if (leader.largeImageUrl) urls.add(leader.largeImageUrl)
  })

  data.posts.forEach((post) => {
    post.images.forEach((url) => {
      if (url) urls.add(url)
    })
    post.fullImages?.forEach((url) => {
      if (url) urls.add(url)
    })
  })

  data.journey.earth.blocks.forEach((block) => addJourneyBlockUrls(block, urls))
  data.journey.planets.forEach((planet) => {
    planet.blocks.forEach((block) => addJourneyBlockUrls(block, urls))
  })

  return urls
}

export function storagePathFromDownloadUrl(url: string): string | null {
  if (!url.includes('firebasestorage.googleapis.com')) return null

  try {
    const match = url.match(/\/o\/([^?]+)/)
    if (!match?.[1]) return null
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

/** Only delete files we uploaded under `images/`. */
export function isManagedStorageUrl(url: string): boolean {
  const path = storagePathFromDownloadUrl(url)
  return Boolean(path?.startsWith('images/'))
}

export function findOrphanedImageUrls(
  previousUrls: Set<string>,
  nextUrls: Set<string>,
): string[] {
  return [...previousUrls].filter(
    (url) => !nextUrls.has(url) && isManagedStorageUrl(url),
  )
}
