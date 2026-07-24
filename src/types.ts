export type LeadershipRole =
  | 'School Captain'
  | 'Vice Captain'
  | 'Senior Prefect'
  | 'Sports Captain'
  | 'Media Prefect'
  | 'Prefect'

export interface LeaderProfile {
  id: string
  name: string
  description: string
  role: LeadershipRole
  profilePicUrl: string
  largeImageUrl: string
  x: number
  y: number
  carouselIndex: number
}

/** @deprecated migrated to LeaderProfile */
export interface LeaderHotspot {
  id: string
  name: string
  bio: string
  imageUrl: string
  x: number
  y: number
}

export interface VideoItem {
  id: string
  title: string
  youtubeUrl: string
  description: string
  emoji: string
  /** @deprecated migrated to releaseDate on load */
  releaseDays?: number
  releaseDate?: string
}

export interface GridVideoItem {
  id: string
  title: string
  youtubeUrl: string
}

export interface NavEmojis {
  homepage: string
  theatre: string
  gallery: string
  journey: string
  /** @deprecated migrated to homepage */
  leaders?: string
}

export type JourneyPlanetType = 'rocky' | 'gas' | 'ice' | 'ringed' | 'moon' | 'earth'

export interface JourneyBlockLayout {
  /** Percent of pinboard width (0–100) */
  x: number
  /** Percent of pinboard height (0–100) */
  y: number
  /** Percent of pinboard width */
  width: number
  /** Percent of pinboard height */
  height: number
  zIndex: number
  rotation?: number
}

export type JourneyTextVariant = 'plain' | 'gold-title'

export interface JourneyTextBlock {
  id: string
  type: 'text'
  content: string
  layout: JourneyBlockLayout
  fontSize?: number
  textAlign?: 'left' | 'center' | 'right'
  textColor?: string
  backgroundColor?: string
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  variant?: JourneyTextVariant
}

export interface JourneyImageBlock {
  id: string
  type: 'image'
  imageUrl: string
  caption?: string
  layout: JourneyBlockLayout
  objectFit?: 'cover' | 'contain'
  backgroundColor?: string
}

export interface JourneyCarouselBlock {
  id: string
  type: 'carousel'
  images: string[]
  caption?: string
  layout: JourneyBlockLayout
  backgroundColor?: string
}

export interface JourneyVideoBlock {
  id: string
  type: 'video'
  youtubeUrl: string
  title?: string
  layout: JourneyBlockLayout
  backgroundColor?: string
}

export type JourneySpaceIconKind = 'ufo' | 'asteroid' | 'comet' | 'satellite'

export interface JourneySpaceIconBlock {
  id: string
  type: 'space-icon'
  icon: JourneySpaceIconKind
  layout: JourneyBlockLayout
}

export type JourneyBlock =
  | JourneyTextBlock
  | JourneyImageBlock
  | JourneyCarouselBlock
  | JourneyVideoBlock
  | JourneySpaceIconBlock

export interface JourneyPlanetPage {
  id: string
  name: string
  planetColor: string
  planetSize: number
  /** Vertical position along center line, percent from top of section (0–100) */
  planetY: number
  planetType: JourneyPlanetType
  blocks: JourneyBlock[]
}

export interface JourneyData {
  launchTitle: string
  launchIntro: string
  /** First journey stop — Earth by default */
  earth: JourneyPlanetPage
  planets: JourneyPlanetPage[]
}

export type PostAspectRatio = '2/1' | '1' | '4/5' | '3/4' | '16/9'

export interface PostImageMeta {
  panX: number
  panY: number
  zoom: number
}

export interface GalleryPost {
  id: string
  caption: string
  images: string[]
  /** Higher-resolution variants for lightbox — parallel to `images`. */
  fullImages?: string[]
  imageMeta?: PostImageMeta[]
  aspectRatio?: PostAspectRatio
  likes: number
  liked: boolean
  createdAt: string
  pinned?: boolean
}

export interface SiteData {
  homepageTitle: string
  homepageSlogan: string
  teamCarouselImages: string[]
  leaders: LeaderProfile[]
  videos: VideoItem[]
  theatreGridVideos: GridVideoItem[]
  posts: GalleryPost[]
  journey: JourneyData
  navEmojis: NavEmojis
  /** @deprecated migrated to teamCarouselImages */
  groupPhotoUrl?: string
  /** @deprecated migrated to homepageTitle */
  groupTitle?: string
  groupSubtitle?: string
  introText?: string
}
