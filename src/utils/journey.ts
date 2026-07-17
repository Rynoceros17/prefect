import type {
  JourneyBlock,
  JourneyBlockLayout,
  JourneyCarouselBlock,
  JourneyData,
  JourneyImageBlock,
  JourneyPlanetPage,
  JourneyPlanetType,
  JourneySpaceIconBlock,
  JourneySpaceIconKind,
  JourneyTextBlock,
  JourneyVideoBlock,
} from '../types'

export const JOURNEY_PLANET_TYPES: { value: JourneyPlanetType; label: string }[] = [
  { value: 'earth', label: 'Earth' },
  { value: 'rocky', label: 'Rocky' },
  { value: 'gas', label: 'Gas giant' },
  { value: 'ice', label: 'Ice world' },
  { value: 'ringed', label: 'Ringed' },
  { value: 'moon', label: 'Moon' },
]

export const JOURNEY_FONT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'var(--font-display)', label: 'Display' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Serif' },
  { value: '"Palatino Linotype", Palatino, serif', label: 'Palatino' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Sans' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
  { value: '"Courier New", Courier, monospace', label: 'Mono' },
  { value: '"Segoe UI", system-ui, sans-serif', label: 'System' },
]

const DEFAULT_BOX_COLOR = 'rgba(12, 16, 36, 0.88)'

export { DEFAULT_BOX_COLOR as JOURNEY_DEFAULT_BOX_COLOR }

export function defaultLayout(
  overrides: Partial<JourneyBlockLayout> = {},
  index = 0,
): JourneyBlockLayout {
  const col = index % 3
  const row = Math.floor(index / 3)
  return {
    x: 6 + col * 30,
    y: 8 + row * 28,
    width: 26,
    height: 24,
    zIndex: index + 1,
    rotation: 0,
    ...overrides,
  }
}

type TextBlockOptions = Partial<
  Pick<
    JourneyTextBlock,
    | 'fontSize'
    | 'textAlign'
    | 'textColor'
    | 'backgroundColor'
    | 'fontFamily'
    | 'fontWeight'
    | 'fontStyle'
    | 'variant'
  >
>

export function createTextBlock(
  content = '',
  layout?: Partial<JourneyBlockLayout>,
  index = 0,
  options: TextBlockOptions = {},
): JourneyTextBlock {
  return {
    id: `jblock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'text',
    content,
    layout: defaultLayout({ width: 28, height: 22, ...layout }, index),
    fontSize: options.fontSize ?? 15,
    textAlign: options.textAlign ?? 'left',
    textColor: options.textColor ?? '#f5f0e8',
    backgroundColor: options.backgroundColor ?? DEFAULT_BOX_COLOR,
    fontFamily: options.fontFamily ?? '',
    fontWeight: options.fontWeight ?? 'normal',
    fontStyle: options.fontStyle ?? 'normal',
    variant: options.variant ?? 'plain',
  }
}

export function createGoldTitleBlock(
  content = 'OUR PREFECT JOURNEY',
  layout?: Partial<JourneyBlockLayout>,
): JourneyTextBlock {
  return createTextBlock(content, { x: 14, y: 6, width: 72, height: 32, zIndex: 3, ...layout }, 0, {
    variant: 'gold-title',
    fontSize: 42,
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  })
}

export function createImageBlock(
  imageUrl = '',
  layout?: Partial<JourneyBlockLayout>,
  index = 0,
): JourneyImageBlock {
  return {
    id: `jblock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'image',
    imageUrl,
    caption: '',
    layout: defaultLayout({ width: 30, height: 32, ...layout }, index),
    objectFit: 'cover',
    backgroundColor: DEFAULT_BOX_COLOR,
  }
}

export function createCarouselBlock(
  images: string[] = [],
  layout?: Partial<JourneyBlockLayout>,
  index = 0,
): JourneyCarouselBlock {
  return {
    id: `jblock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'carousel',
    images,
    caption: '',
    layout: defaultLayout({ width: 34, height: 36, ...layout }, index),
    backgroundColor: DEFAULT_BOX_COLOR,
  }
}

export function createVideoBlock(
  youtubeUrl = '',
  layout?: Partial<JourneyBlockLayout>,
  index = 0,
): JourneyVideoBlock {
  return {
    id: `jblock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'video',
    youtubeUrl,
    title: '',
    layout: defaultLayout({ width: 36, height: 30, ...layout }, index),
    backgroundColor: DEFAULT_BOX_COLOR,
  }
}

export function createSpaceIconBlock(
  icon: JourneySpaceIconKind = 'ufo',
  layout?: Partial<JourneyBlockLayout>,
  index = 0,
): JourneySpaceIconBlock {
  return {
    id: `jblock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'space-icon',
    icon,
    layout: defaultLayout({ width: 10, height: 12, ...layout }, index),
  }
}

export function getGlassBackground(color?: string): string {
  if (!color || color === 'transparent') return 'transparent'
  const base = color.startsWith('#') ? color.slice(0, 7) : '#0c1024'
  return `color-mix(in srgb, ${base} 30%, transparent)`
}

export function createDefaultLaunchBlocks(
  launchTitle = 'OUR PREFECT JOURNEY',
  launchIntro = 'Strap in and travel with our prefects from launch day to every milestone along the way.',
): JourneyBlock[] {
  return [
    createGoldTitleBlock(launchTitle),
    createTextBlock(launchIntro, { x: 18, y: 32, width: 64, height: 18, zIndex: 2 }, 1, {
      textAlign: 'center',
      backgroundColor: 'rgba(12, 16, 36, 0.55)',
    }),
    createSpaceIconBlock('ufo', { x: 5, y: 58, width: 9, height: 11, zIndex: 1 }, 2),
    createSpaceIconBlock('asteroid', { x: 86, y: 14, width: 8, height: 10, zIndex: 1 }, 3),
    createSpaceIconBlock('comet', { x: 84, y: 68, width: 10, height: 11, zIndex: 1 }, 4),
    createSpaceIconBlock('satellite', { x: 4, y: 18, width: 9, height: 11, zIndex: 1 }, 5),
  ]
}

export function createPlanetPage(partial?: Partial<JourneyPlanetPage>): JourneyPlanetPage {
  return {
    id: partial?.id ?? `planet-${Date.now()}`,
    name: partial?.name ?? 'New Planet',
    planetColor: partial?.planetColor ?? '#7b5cff',
    planetSize: partial?.planetSize ?? 1,
    planetY: partial?.planetY ?? 58,
    planetType: partial?.planetType ?? 'rocky',
    blocks: partial?.blocks ?? [
      createTextBlock('Tell the story of this stop on the journey…', { x: 8, y: 10 }, 0),
    ],
  }
}

function normalizeLayout(
  layout: Partial<JourneyBlockLayout> | undefined,
  index: number,
  text = false,
): JourneyBlockLayout {
  const base = defaultLayout({}, index)
  const minSize = text ? 1 : 12
  const maxSize = text ? 100 : 90
  const width = Math.min(maxSize, Math.max(minSize, layout?.width ?? base.width))
  const height = Math.min(maxSize, Math.max(minSize, layout?.height ?? base.height))
  return {
    x: clamp(layout?.x ?? base.x, 0, Math.max(0, 100 - width)),
    y: clamp(layout?.y ?? base.y, 0, Math.max(0, 100 - height)),
    width,
    height,
    zIndex: layout?.zIndex ?? base.zIndex,
    rotation: layout?.rotation ?? 0,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function normalizeBlock(block: JourneyBlock, index: number): JourneyBlock {
  const isText = block.type === 'text'
  const layout = normalizeLayout(
    'layout' in block ? (block as { layout?: JourneyBlockLayout }).layout : undefined,
    index,
    isText,
  )

  if (block.type === 'text') {
    const fontSize =
      typeof block.fontSize === 'number' && block.fontSize > 0 ? block.fontSize : undefined
    return {
      ...block,
      content: block.content ?? '',
      layout,
      fontSize: fontSize ?? (block.variant === 'gold-title' ? 42 : 15),
      textAlign: block.textAlign ?? 'left',
      textColor: block.textColor ?? '#f5f0e8',
      backgroundColor:
        block.backgroundColor ??
        (block.variant === 'gold-title' ? 'transparent' : DEFAULT_BOX_COLOR),
      fontFamily: block.fontFamily ?? '',
      fontWeight: block.fontWeight ?? 'normal',
      fontStyle: block.fontStyle ?? 'normal',
      variant: block.variant ?? 'plain',
    }
  }
  if (block.type === 'image') {
    return {
      ...block,
      imageUrl: block.imageUrl ?? '',
      caption: block.caption ?? '',
      layout,
      objectFit: block.objectFit ?? 'cover',
      backgroundColor: block.backgroundColor ?? DEFAULT_BOX_COLOR,
    }
  }
  if (block.type === 'video') {
    return {
      ...block,
      youtubeUrl: block.youtubeUrl ?? '',
      title: block.title ?? '',
      layout,
      backgroundColor: block.backgroundColor ?? DEFAULT_BOX_COLOR,
    }
  }
  if (block.type === 'space-icon') {
    return {
      ...block,
      icon: block.icon ?? 'ufo',
      layout,
    }
  }
  return {
    ...block,
    images: block.images ?? [],
    caption: block.caption ?? '',
    layout,
    backgroundColor: block.backgroundColor ?? DEFAULT_BOX_COLOR,
  }
}

export function createEarthPage(
  partial?: Partial<JourneyPlanetPage>,
  launchTitle?: string,
  launchIntro?: string,
): JourneyPlanetPage {
  const blocks =
    partial?.blocks && partial.blocks.length > 0
      ? partial.blocks
      : createDefaultLaunchBlocks(
          launchTitle ?? 'OUR PREFECT JOURNEY',
          launchIntro ??
            'Strap in and travel with our prefects from launch day to every milestone along the way.',
        )

  return createPlanetPage({
    id: 'earth',
    name: 'Earth',
    planetColor: '#2d6eb5',
    planetSize: 1.4,
    planetY: 58,
    planetType: 'earth',
    ...partial,
    blocks,
  })
}

function syncLaunchFieldsFromBlocks(blocks: JourneyBlock[], title: string, intro: string) {
  const titleBlock = blocks.find((b) => b.type === 'text' && b.variant === 'gold-title')
  const introBlock = blocks.find(
    (b) => b.type === 'text' && b.variant !== 'gold-title' && b.content.trim().length > 0,
  )
  return {
    launchTitle: titleBlock?.type === 'text' ? titleBlock.content : title,
    launchIntro: introBlock?.type === 'text' ? introBlock.content : intro,
  }
}

function stripEmojiBlocks(blocks: JourneyBlock[]): JourneyBlock[] {
  return blocks.filter((b) => (b as { type?: string }).type !== 'emoji')
}

export function normalizeJourneyData(journey?: Partial<JourneyData>): JourneyData {
  type LegacyJourney = Partial<JourneyData> & {
    launchBlocks?: JourneyBlock[]
    launchPlanetSize?: number
    launchPlanetY?: number
  }

  const defaults: JourneyData = {
    launchTitle: 'OUR PREFECT JOURNEY',
    launchIntro:
      'Strap in and travel with our prefects from launch day to every milestone along the way.',
    earth: createEarthPage(),
    planets: [],
  }

  const merged = { ...defaults, ...journey } as LegacyJourney
  let launchTitle = merged.launchTitle ?? defaults.launchTitle
  if (
    launchTitle === 'Follow our Prefects journey' ||
    launchTitle === 'Follow our Prefects Journey'
  ) {
    launchTitle = defaults.launchTitle
  }
  const launchIntro = merged.launchIntro ?? defaults.launchIntro

  let earthBlocks = stripEmojiBlocks(merged.earth?.blocks ?? merged.launchBlocks ?? []).map(
    (block, i) => normalizeBlock(block as JourneyBlock, i),
  )
  if (earthBlocks.length === 0) {
    earthBlocks = createDefaultLaunchBlocks(launchTitle, launchIntro)
  }

  const synced = syncLaunchFieldsFromBlocks(earthBlocks, launchTitle, launchIntro)

  const earth = createPlanetPage({
    ...merged.earth,
    id: 'earth',
    name: merged.earth?.name ?? 'Earth',
    planetColor: merged.earth?.planetColor ?? '#2d6eb5',
    planetSize: Math.max(0.1, merged.earth?.planetSize ?? merged.launchPlanetSize ?? 1.4),
    planetY: clamp(merged.earth?.planetY ?? merged.launchPlanetY ?? 58, 5, 95),
    planetType: merged.earth?.planetType ?? 'earth',
    blocks: earthBlocks,
  })

  const planets = (merged.planets ?? [])
    .filter((planet) => planet.name?.trim().toLowerCase() !== 'term one')
    .map((planet, index) =>
    createPlanetPage({
      ...planet,
      id: planet.id || `planet-${index + 1}`,
      planetY: clamp(planet.planetY ?? 58, 5, 95),
      planetSize: Math.max(0.1, planet.planetSize ?? 1),
      blocks: stripEmojiBlocks(planet.blocks ?? []).map((block, i) =>
        normalizeBlock(block as JourneyBlock, i),
      ),
    }),
  )

  if (planets.length === 0) {
    planets.push(
      createPlanetPage({
        id: 'planet-1',
        name: 'Community Orbit',
        planetColor: '#5ec8ff',
        planetSize: 1.1,
        planetType: 'ringed',
        blocks: [
          createCarouselBlock(
            [
              'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=600&fit=crop',
              'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=600&fit=crop',
            ],
            { x: 8, y: 8, width: 36, height: 40 },
            0,
          ),
          createTextBlock(
            'Orbiting community events, spirit days, and moments that brought everyone together.',
            { x: 55, y: 14, width: 32, height: 28 },
            1,
          ),
        ],
      }),
    )
  }

  return {
    launchTitle: synced.launchTitle,
    launchIntro: synced.launchIntro,
    earth,
    planets,
  }
}

export function getBlockBackgroundColor(block: JourneyBlock): string | undefined {
  if (block.type === 'text' && block.variant === 'gold-title') {
    return block.backgroundColor === 'transparent' ? undefined : block.backgroundColor
  }
  if ('backgroundColor' in block) return block.backgroundColor
  return DEFAULT_BOX_COLOR
}
