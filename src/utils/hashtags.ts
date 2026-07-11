/** Extract unique hashtags from caption text (case-insensitive keys). */
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\w]+/g) ?? []
  const seen = new Set<string>()
  const result: string[] = []
  for (const tag of matches) {
    const key = tag.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(key)
    }
  }
  return result
}

/** Collect display-form hashtags across all captions. */
export function collectHashtags(captions: string[]): string[] {
  const map = new Map<string, string>()
  for (const caption of captions) {
    const matches = caption.match(/#[\w]+/g) ?? []
    for (const tag of matches) {
      const key = tag.toLowerCase()
      if (!map.has(key)) map.set(key, tag)
    }
  }
  return Array.from(map.values())
}

export function postMatchesHashtag(caption: string, filterTag: string | null): boolean {
  if (!filterTag) return true
  return extractHashtags(caption).includes(filterTag.toLowerCase())
}
