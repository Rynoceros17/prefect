const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function getMonthLabels(): readonly string[] {
  return MONTH_LABELS
}

export function formatPostDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function toDateInputValue(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return toDateInputValue(new Date().toISOString())
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateInputValue(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date().toISOString()
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString()
}

export function postMatchesMonth(createdAt: string, month: number | null, year: number): boolean {
  if (month === null) return true
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return false
  return date.getMonth() + 1 === month && date.getFullYear() === year
}

export function countPostsByMonth(
  posts: { createdAt: string }[],
  year: number,
): number[] {
  const counts = Array.from({ length: 12 }, () => 0)
  for (const post of posts) {
    const date = new Date(post.createdAt)
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) continue
    counts[date.getMonth()] += 1
  }
  return counts
}
