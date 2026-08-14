import type { LeaderHotspot, LeaderProfile, LeadershipRole, NavEmojis, SiteData } from '../types'
import { DEFAULT_SITE_DATA } from '../data/defaults'
import { normalizeRole } from './leaders'
import { normalizeJourneyData } from './journey'
import { normalizeTheatreGridVideos } from './theatreGrid'

const placeholderPortrait = (seed: number) =>
  `https://images.unsplash.com/photo-${seed}?w=400&h=400&fit=crop&crop=face`

const placeholderHero = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop`

const DEFAULT_POSITIONS = [
  { x: 22, y: 28 },
  { x: 38, y: 25 },
  { x: 55, y: 30 },
  { x: 72, y: 27 },
  { x: 48, y: 42 },
]

function migrateHomepageTitle(parsed: Partial<SiteData>): string {
  const candidate = parsed.homepageTitle ?? parsed.groupTitle
  if (
    !candidate ||
    candidate === 'Our Leadership Body' ||
    candidate === 'Ruse Prefect Body 2027' ||
    candidate === 'meet the prefects'
  ) {
    return DEFAULT_SITE_DATA.homepageTitle
  }
  return candidate
}

function migrateLeader(leader: Partial<LeaderProfile> & Partial<LeaderHotspot>, index: number): LeaderProfile {
  const defaultRoles: LeadershipRole[] = [
    'School Captain',
    'Vice Captain',
    'Senior Prefect',
    'Sports Captain',
    'Media Prefect',
    'Prefect',
  ]

  const imageUrl =
    leader.profilePicUrl ??
    leader.largeImageUrl ??
    leader.imageUrl ??
    placeholderPortrait(1507003215329 + index)

  const position = DEFAULT_POSITIONS[index] ?? { x: 50, y: 50 }

  return {
    id: leader.id ?? `leader-${index + 1}`,
    name: leader.name ?? 'New Leader',
    description: leader.description ?? leader.bio ?? 'Add a description for this leader.',
    role: normalizeRole(leader.role ?? defaultRoles[index]),
    profilePicUrl: leader.profilePicUrl ?? imageUrl,
    largeImageUrl: leader.largeImageUrl ?? leader.imageUrl ?? imageUrl,
    x: leader.x ?? position.x,
    y: leader.y ?? position.y,
    carouselIndex: leader.carouselIndex ?? 0,
  }
}

function migrateNavEmojis(navEmojis?: Partial<NavEmojis>): NavEmojis {
  return {
    homepage: navEmojis?.homepage ?? navEmojis?.leaders ?? DEFAULT_SITE_DATA.navEmojis.homepage,
    theatre: navEmojis?.theatre ?? DEFAULT_SITE_DATA.navEmojis.theatre,
    gallery: navEmojis?.gallery ?? DEFAULT_SITE_DATA.navEmojis.gallery,
    journey: navEmojis?.journey ?? DEFAULT_SITE_DATA.navEmojis.journey,
    games: navEmojis?.games ?? DEFAULT_SITE_DATA.navEmojis.games,
  }
}

export function migrateSiteData(parsed: Partial<SiteData>): SiteData {
  const leaders = (parsed.leaders ?? DEFAULT_SITE_DATA.leaders).map((leader, index) =>
    migrateLeader(leader as Partial<LeaderProfile> & Partial<LeaderHotspot>, index),
  )

  const teamCarouselImages =
    parsed.teamCarouselImages?.length
      ? parsed.teamCarouselImages
      : parsed.groupPhotoUrl
        ? [parsed.groupPhotoUrl]
        : DEFAULT_SITE_DATA.teamCarouselImages

  return {
    ...DEFAULT_SITE_DATA,
    ...parsed,
    homepageTitle: migrateHomepageTitle(parsed),
    homepageSlogan:
      parsed.homepageSlogan ??
      parsed.groupSubtitle ??
      DEFAULT_SITE_DATA.homepageSlogan,
    teamCarouselImages,
    leaders,
    navEmojis: migrateNavEmojis(parsed.navEmojis),
    videos: parsed.videos ?? DEFAULT_SITE_DATA.videos,
    theatreGridVideos: normalizeTheatreGridVideos(
      parsed.theatreGridVideos ?? DEFAULT_SITE_DATA.theatreGridVideos,
    ),
    journey: normalizeJourneyData(parsed.journey ?? DEFAULT_SITE_DATA.journey),
    posts: (parsed.posts ?? DEFAULT_SITE_DATA.posts).map((post, index) => {
      const next = {
        ...post,
        likes: post.likes ?? 0,
        liked: false,
        createdAt: post.createdAt ?? new Date(Date.now() - index * 86400000).toISOString(),
      }
      if (post.fullImages?.length) {
        next.fullImages = post.fullImages
      } else {
        delete next.fullImages
      }
      return next
    }),
  }
}

export function createLeaderAt(
  index: number,
  x: number,
  y: number,
  carouselIndex: number,
): LeaderProfile {
  return migrateLeader(
    {
      id: `leader-${Date.now()}`,
      name: 'New Leader',
      description: 'Add a description for this leader.',
      role: 'Prefect',
      profilePicUrl: placeholderPortrait(1507003215329),
      largeImageUrl: placeholderHero('1522071820081-009f0129c71c'),
      x,
      y,
      carouselIndex,
    },
    index,
  )
}

export function adjustLeadersForRemovedImage(
  leaders: LeaderProfile[],
  removedIndex: number,
): LeaderProfile[] {
  return leaders
    .filter((leader) => leader.carouselIndex !== removedIndex)
    .map((leader) =>
      leader.carouselIndex > removedIndex
        ? { ...leader, carouselIndex: leader.carouselIndex - 1 }
        : leader,
    )
}
