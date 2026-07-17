import type { GalleryPost } from '../../types'
import { getMonthLabels } from '../../utils/postDates'

interface GallerySidebarProps {
  hashtags: string[]
  activeHashtag: string | null
  onHashtagChange: (tag: string | null) => void
  activeMonth: number | null
  onMonthChange: (month: number | null) => void
  filterYear: number
  onFilterYearChange: (year: number) => void
  monthCounts: number[]
}

export function GallerySidebar({
  hashtags,
  activeHashtag,
  onHashtagChange,
  activeMonth,
  onMonthChange,
  filterYear,
  onFilterYearChange,
  monthCounts,
}: GallerySidebarProps) {
  const monthLabels = getMonthLabels()
  const hasFilters = activeHashtag !== null || activeMonth !== null

  const clearFilters = () => {
    onHashtagChange(null)
    onMonthChange(null)
  }

  return (
    <aside className="ig-sidebar" aria-label="Gallery filters">
      <div className="ig-sidebar__panel">
        <div className="ig-sidebar__header">
          <h2 className="ig-sidebar__title">Filters</h2>
          {hasFilters && (
            <button type="button" className="ig-sidebar__clear" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        {hashtags.length > 0 && (
          <section className="ig-sidebar__section">
            <h3 className="ig-sidebar__label">Hashtags</h3>
            <div className="ig-sidebar__hashtags">
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
          </section>
        )}

        <section className="ig-sidebar__section">
          <div className="ig-sidebar__month-header">
            <h3 className="ig-sidebar__label">By month</h3>
            <div className="ig-sidebar__year">
              <button
                type="button"
                className="ig-sidebar__year-btn"
                onClick={() => onFilterYearChange(filterYear - 1)}
                aria-label="Previous year"
              >
                ‹
              </button>
              <span className="ig-sidebar__year-label">{filterYear}</span>
              <button
                type="button"
                className="ig-sidebar__year-btn"
                onClick={() => onFilterYearChange(filterYear + 1)}
                aria-label="Next year"
              >
                ›
              </button>
            </div>
          </div>

          <div className="ig-month-grid">
            {monthLabels.map((label, index) => {
              const month = index + 1
              const count = monthCounts[index]
              const isActive = activeMonth === month
              return (
                <button
                  key={label}
                  type="button"
                  className={`ig-month-chip ${isActive ? 'ig-month-chip--active' : ''} ${
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
        </section>
      </div>
    </aside>
  )
}

export function sortPostsByDate(posts: GalleryPost[]): GalleryPost[] {
  return [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
