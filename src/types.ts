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

export interface NavEmojis {
  homepage: string
  theatre: string
  gallery: string
  /** @deprecated migrated to homepage */
  leaders?: string
}

export type PostAspectRatio = '1' | '4/5' | '3/4' | '16/9'

export interface PostImageMeta {
  panX: number
  panY: number
  zoom: number
}

export interface GalleryPost {
  id: string
  caption: string
  images: string[]
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
  posts: GalleryPost[]
  navEmojis: NavEmojis
  /** @deprecated migrated to teamCarouselImages */
  groupPhotoUrl?: string
  /** @deprecated migrated to homepageTitle */
  groupTitle?: string
  groupSubtitle?: string
  introText?: string
}
