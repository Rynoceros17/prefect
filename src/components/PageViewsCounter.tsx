import { usePageViews } from '../context/PageViewsContext'
import { formatViewCount } from '../services/pageViewService'

export function PageViewsCounter() {
  const { totalViews } = usePageViews()

  return (
    <div
      className="page-views-counter"
      aria-label={`${totalViews.toLocaleString()} total page views across the site`}
    >
      <svg className="page-views-counter__icon" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
      <span className="page-views-counter__count">{formatViewCount(totalViews)}</span>
      <span className="page-views-counter__label">views</span>
    </div>
  )
}
