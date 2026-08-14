import type { JourneyBlock, SiteData } from '../types'
import { isDataUrl, resolveImageUrl } from '../services/imageUpload'

function storagePath(relativePath: string): string {
  return `images/${relativePath}`
}

async function uploadJourneyBlocks(blocks: JourneyBlock[]): Promise<JourneyBlock[]> {
  let changed = false
  const next = await Promise.all(
    blocks.map(async (block) => {
      if (block.type === 'image') {
        const imageUrl = await resolveImageUrl(block.imageUrl, storagePath(`journey/${block.id}`))
        if (imageUrl === block.imageUrl) return block
        changed = true
        return { ...block, imageUrl }
      }
      if (block.type === 'carousel') {
        const images = await Promise.all(
          block.images.map((url, index) =>
            resolveImageUrl(url, storagePath(`journey/${block.id}/${index}`)),
          ),
        )
        if (images.every((url, index) => url === block.images[index])) return block
        changed = true
        return { ...block, images }
      }
      return block
    }),
  )
  return changed ? next : blocks
}

function compactFullImages(images: string[], fullImages?: string[]): string[] | undefined {
  if (!fullImages?.length) return undefined

  const compact = images.map((feed, index) => {
    const full = fullImages[index]
    return full && full !== feed ? full : ''
  })

  if (!compact.some(Boolean)) return undefined
  return compact
}

/** Upload any embedded data URLs to Firebase Storage before persisting site data. */
export async function uploadEmbeddedImages(data: SiteData): Promise<SiteData> {
  const teamCarouselImages = await Promise.all(
    data.teamCarouselImages.map((url, index) =>
      resolveImageUrl(url, storagePath(`carousel/${index}`)),
    ),
  )

  const leaders = await Promise.all(
    data.leaders.map(async (leader) => {
      const profilePicUrl = await resolveImageUrl(
        leader.profilePicUrl,
        storagePath(`leaders/${leader.id}/profile`),
      )
      const largeImageUrl = await resolveImageUrl(
        leader.largeImageUrl,
        storagePath(`leaders/${leader.id}/hero`),
      )
      if (profilePicUrl === leader.profilePicUrl && largeImageUrl === leader.largeImageUrl) {
        return leader
      }
      return { ...leader, profilePicUrl, largeImageUrl }
    }),
  )

  const posts = await Promise.all(
    data.posts.map(async (post) => {
      const images = await Promise.all(
        post.images.map((url, index) => {
          if (!isDataUrl(url)) return url
          return resolveImageUrl(url, storagePath(`posts/${post.id}/${index}-feed`))
        }),
      )

      const sourceFull = post.fullImages
      let fullImages = sourceFull
      if (sourceFull?.length) {
        fullImages = await Promise.all(
          sourceFull.map((url, index) => {
            const feedSource = post.images[index]
            if (!url || url === feedSource) return url
            if (!isDataUrl(url)) return url
            return resolveImageUrl(url, storagePath(`posts/${post.id}/${index}-full`))
          }),
        )
      }

      const compactedFull = compactFullImages(images, fullImages)
      const imagesChanged = images.some((url, index) => url !== post.images[index])
      const fullChanged =
        JSON.stringify(compactedFull ?? null) !== JSON.stringify(post.fullImages ?? null)

      if (!imagesChanged && !fullChanged) return post

      const next = { ...post, images }
      if (compactedFull) next.fullImages = compactedFull
      else delete next.fullImages
      return next
    }),
  )

  const earthBlocks = await uploadJourneyBlocks(data.journey.earth.blocks)
  const planets = await Promise.all(
    data.journey.planets.map(async (planet) => {
      const blocks = await uploadJourneyBlocks(planet.blocks)
      return blocks === planet.blocks ? planet : { ...planet, blocks }
    }),
  )

  const earth =
    earthBlocks === data.journey.earth.blocks
      ? data.journey.earth
      : { ...data.journey.earth, blocks: earthBlocks }

  return {
    ...data,
    teamCarouselImages,
    leaders,
    posts,
    journey: {
      ...data.journey,
      earth,
      planets,
    },
  }
}
