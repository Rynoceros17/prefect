import type { GalleryPost } from '../../types'
import { getMonthLabels } from '../../utils/postDates'

interface GalleryFilterBarProps {
  hashtags: string[]
  activeHashtag: string | null
  onHashtagChange: (tag: string | null) => void
  activeMonth: number | null
  onMonthChange: (month: number | null) => void
  filterYear: number
  onFilterYearChange: (year: number) => void
  monthCounts: number[]
}

export function GalleryFilterBar({
  hashtags,
  activeHashtag,
  onHashtagChange,
  activeMonth,
  onMonthChange,
  filterYear,
  onFilterYearChange,
  monthCounts,
}: GalleryFilterBarProps) {
  const monthLabels = getMonthLabels()
  const hasFilters = activeHashtag !== null || activeMonth !== null

  const clearFilters = () => {
    onHashtagChange(null)
    onMonthChange(null)
  }

  return (
    <header className="ig-filter-bar" aria-label="Gallery filters">
      <div className="ig-filter-bar__row ig-filter-bar__row--top">
        <div className="ig-filter-bar__heading">
          <h2 className="ig-filter-bar__title">Filters</h2>
          {hasFilters && (
            <button type="button" className="ig-filter-bar__clear" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {hashtags.length > 0 && (
          <div className="ig-filter-bar__hashtags">
            <span className="ig-filter-bar__label">Hashtags</span>
            <div className="ig-filter-bar__chip-scroll">
              <button
                type="button"
                className={`ig-hashtag-chip ${activeHashtag === null ? 'ig-hashtag-chip--active' : ''}`}
                onClick={() => onHashtagChange(null)}
              >
                All
              </button>
              {hashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`ig-hashtag-chip ${
                    activeHashtag?.toLowerCase() === tag.toLowerCase()
                      ? 'ig-hashtag-chip--active'
                      : ''
                  }`}
                  onClick={() =>
                    onHashtagChange(
                      activeHashtag?.toLowerCase() === tag.toLowerCase() ? null : tag,
                    )
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ig-filter-bar__row ig-filter-bar__row--months">
        <span className="ig-filter-bar__label">By month</span>
        <div className="ig-filter-bar__year">
          <button
            type="button"
            className="ig-filter-bar__year-btn"
            onClick={() => onFilterYearChange(filterYear - 1)}
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="ig-filter-bar__year-label">{filterYear}</span>
          <button
            type="button"
            className="ig-filter-bar__year-btn"
            onClick={() => onFilterYearChange(filterYear + 1)}
            aria-label="Next year"
          >
            ›
          </button>
        </div>
        <div className="ig-filter-bar__month-scroll">
          {monthLabels.map((label, index) => {
            const month = index + 1
            const count = monthCounts[index]
            const isActive = activeMonth === month
            return (
              <button
                key={label}
                type="button"
                className={`ig-month-chip ig-month-chip--compact ${isActive ? 'ig-month-chip--active' : ''} ${
                  count === 0 ? 'ig-month-chip--empty' : ''
                }`}
                onClick={() => onMonthChange(isActive ? null : month)}
                aria-pressed={isActive}
              >
                <span className="ig-month-chip__label">{label}</span>
                <span className="ig-month-chip__count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

/** @deprecated use GalleryFilterBar */
export const GallerySidebar = GalleryFilterBar

export function sortPostsByDate(posts: GalleryPost[]): GalleryPost[] {
  return [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
