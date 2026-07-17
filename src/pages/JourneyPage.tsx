import { JourneyExperience } from '../components/journey/JourneyExperience'
import { useSiteDataContext } from '../context/SiteDataContext'

export function JourneyPage() {
  const { data, updateData } = useSiteDataContext()

  return (
    <div className="journey-page">
      <JourneyExperience
        journey={data.journey}
        onChange={(journey) => updateData((d) => ({ ...d, journey }))}
      />
    </div>
  )
}
