import type { SiteData } from '../types'
import { normalizeJourneyData } from '../utils/journey'

const placeholderPortrait = (seed: number) =>
  `https://images.unsplash.com/photo-${seed}?w=400&h=400&fit=crop&crop=face`

const placeholderHero = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop`

const placeholderGroup =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=800&fit=crop'

export const DEFAULT_SITE_DATA: SiteData = {
  homepageTitle: 'Meet Your Prefects',
  homepageSlogan: 'Guiding vision, building community',
  teamCarouselImages: [
    placeholderGroup,
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&h=800&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=800&fit=crop',
  ],
  leaders: [
    {
      id: 'leader-1',
      name: 'Alex Rivera',
      description:
        'School Captain leading with vision, integrity, and a commitment to bringing our prefect body together.',
      role: 'School Captain',
      profilePicUrl: placeholderPortrait(1507003215329),
      largeImageUrl: placeholderHero('1522071820081-009f0129c71c'),
      x: 22,
      y: 28,
      carouselIndex: 0,
    },
    {
      id: 'leader-2',
      name: 'Jordan Chen',
      description:
        'Vice Captain supporting the team across events, culture, and day-to-day prefect leadership.',
      role: 'Vice Captain',
      profilePicUrl: placeholderPortrait(1494790108377),
      largeImageUrl: placeholderHero('1517245386807-bb43f82c33c4'),
      x: 38,
      y: 25,
      carouselIndex: 0,
    },
    {
      id: 'leader-3',
      name: 'Sam Okafor',
      description:
        'Senior Prefect helping coordinate initiatives and mentor younger leaders across the school.',
      role: 'Senior Prefect',
      profilePicUrl: placeholderPortrait(1500648767791),
      largeImageUrl: placeholderHero('1521737711862-ea3e973327c1'),
      x: 55,
      y: 30,
      carouselIndex: 0,
    },
    {
      id: 'leader-4',
      name: 'Morgan Lee',
      description:
        'Sports Captain championing school spirit, athletics, and inclusive participation in sport.',
      role: 'Sports Captain',
      profilePicUrl: placeholderPortrait(1438761681033),
      largeImageUrl: placeholderHero('1552664730-d307ca884978'),
      x: 72,
      y: 27,
      carouselIndex: 0,
    },
    {
      id: 'leader-5',
      name: 'Taylor Brooks',
      description:
        'Media Prefect capturing our year through photos, videos, and social content.',
      role: 'Media Prefect',
      profilePicUrl: placeholderPortrait(1544005313),
      largeImageUrl: placeholderHero('1556761175-5973dc0f32e7'),
      x: 48,
      y: 42,
      carouselIndex: 0,
    },
  ],
  videos: [
    {
      id: 'video-1',
      title: 'Prefect Intro Video',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Meet our prefect team and hear their vision for the year ahead.',
      emoji: '🎤',
      releaseDate: '2026-07-11',
    },
    {
      id: 'video-2',
      title: 'Valentines Day Video',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      description: 'A special Valentines Day message from our prefects.',
      emoji: '💝',
      releaseDate: '2026-07-25',
    },
    {
      id: 'video-3',
      title: 'Finale Music Video',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      description: 'The grand finale — our prefects close out the year in style.',
      emoji: '🎬',
      releaseDate: '2026-08-10',
    },
  ],
  theatreGridVideos: [
    {
      id: 'grid-video-1',
      title: 'Assembly Highlights',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'grid-video-2',
      title: 'Sports Day Recap',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    },
    {
      id: 'grid-video-3',
      title: 'Prefect Q&A',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    },
    { id: 'grid-video-4', title: '', youtubeUrl: '' },
    { id: 'grid-video-5', title: '', youtubeUrl: '' },
    { id: 'grid-video-6', title: '', youtubeUrl: '' },
    { id: 'grid-video-7', title: '', youtubeUrl: '' },
    { id: 'grid-video-8', title: '', youtubeUrl: '' },
    { id: 'grid-video-9', title: '', youtubeUrl: '' },
  ],
  posts: [
    {
      id: 'post-1',
      caption: 'Behind the scenes at our latest leadership retreat ✨ #prefects #events',
      images: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1521737711862-ea3e973327c1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop',
      ],
      likes: 128,
      liked: false,
      pinned: true,
      aspectRatio: '2/1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'post-2',
      caption: 'Celebrating milestones together 🎉 #prefects',
      images: [
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=800&fit=crop',
      ],
      likes: 94,
      liked: false,
      aspectRatio: '2/1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'post-3',
      caption: 'Planning session vibes — ideas flowing everywhere #planning #teamwork',
      images: [
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop',
      ],
      likes: 67,
      liked: false,
      aspectRatio: '2/1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  journey: normalizeJourneyData({}),
  navEmojis: {
    homepage: '🏠',
    theatre: '🎭',
    gallery: '📸',
    journey: '🚀',
    games: '🎮',
  },
}

export const STORAGE_KEY = 'leadership-gallery-data'
