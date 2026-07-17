import { TheatreStage } from '../components/theatre/TheatreStage'
import { TheatreVideoGrid } from '../components/theatre/TheatreVideoGrid'
import { useSiteDataContext } from '../context/SiteDataContext'

export function TheatrePage() {
  const { data, updateData } = useSiteDataContext()

  return (
    <div className="theatre-page">
      <TheatreStage
        videos={data.videos}
        onUpdateVideos={(videos) => updateData((d) => ({ ...d, videos }))}
      />
      <TheatreVideoGrid
        videos={data.theatreGridVideos}
        onUpdateVideos={(theatreGridVideos) =>
          updateData((d) => ({ ...d, theatreGridVideos }))
        }
      />
    </div>
  )
}
