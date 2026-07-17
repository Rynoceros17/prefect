import type { JourneyBlock, SiteData } from '../types'
import { resolveImageUrl } from '../services/imageUpload'

function newImagePath(folder: string): string {
  return `images/${folder}/${crypto.randomUUID()}`
}

async function uploadJourneyBlocks(blocks: JourneyBlock[]): Promise<JourneyBlock[]> {
  let changed = false
  const next = await Promise.all(
    blocks.map(async (block) => {
      if (block.type === 'image') {
        const imageUrl = await resolveImageUrl(block.imageUrl, newImagePath(`journey/${block.id}`))
        if (imageUrl === block.imageUrl) return block
        changed = true
        return { ...block, imageUrl }
      }
      if (block.type === 'carousel') {
        const images = await Promise.all(
          block.images.map((url, index) =>
            resolveImageUrl(url, newImagePath(`journey/${block.id}/${index}`)),
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

/** Upload any embedded data URLs to Firebase Storage before persisting site data. */
export async function uploadEmbeddedImages(data: SiteData): Promise<SiteData> {
  const teamCarouselImages = await Promise.all(
    data.teamCarouselImages.map((url, index) =>
      resolveImageUrl(url, newImagePath(`carousel/${index}`)),
    ),
  )

  const leaders = await Promise.all(
    data.leaders.map(async (leader) => {
      const profilePicUrl = await resolveImageUrl(
        leader.profilePicUrl,
        newImagePath(`leaders/${leader.id}/profile`),
      )
      const largeImageUrl = await resolveImageUrl(
        leader.largeImageUrl,
        newImagePath(`leaders/${leader.id}/hero`),
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
        post.images.map((url, index) => resolveImageUrl(url, newImagePath(`posts/${post.id}/${index}`)),
        ),
      )
      if (images.every((url, index) => url === post.images[index])) return post
      return { ...post, images }
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
