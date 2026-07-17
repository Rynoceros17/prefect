import { motion } from 'framer-motion'
import { useEditMode } from '../../context/EditModeContext'
import type { GridVideoItem } from '../../types'
import { getYoutubeEmbedUrl } from '../../utils/youtube'

interface TheatreVideoGridProps {
  videos: GridVideoItem[]
  onUpdateVideos: (videos: GridVideoItem[]) => void
}

export function TheatreVideoGrid({ videos, onUpdateVideos }: TheatreVideoGridProps) {
  const { isEditMode } = useEditMode()

  const updateVideo = (index: number, updated: GridVideoItem) => {
    onUpdateVideos(videos.map((video, i) => (i === index ? { ...video, ...updated } : video)))
  }

  return (
    <section className="theatre-video-grid" aria-label="More prefect videos">
      <motion.h2
        className="theatre-video-grid__heading"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
      >
        More Videos
      </motion.h2>

      <div className="theatre-video-grid__cells">
        {videos.map((video, index) => {
          const embedUrl = getYoutubeEmbedUrl(video.youtubeUrl)

          return (
            <motion.article
              key={video.id}
              className="theatre-video-grid__cell"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <div className="theatre-video-grid__frame">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={video.title || `Video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="theatre-video-grid__embed"
                  />
                ) : (
                  <div className="theatre-video-grid__placeholder">
                    {isEditMode ? 'Add a YouTube URL below' : 'Video coming soon'}
                  </div>
                )}
              </div>

              {!isEditMode && video.title && (
                <h3 className="theatre-video-grid__caption">{video.title}</h3>
              )}

              {isEditMode && (
                <div className="theatre-video-grid__edit">
                  <input
                    className="edit-input"
                    value={video.title}
                    onChange={(e) => updateVideo(index, { ...video, title: e.target.value })}
                    placeholder="Video title"
                  />
                  <input
                    className="edit-input"
                    value={video.youtubeUrl}
                    onChange={(e) => updateVideo(index, { ...video, youtubeUrl: e.target.value })}
                    placeholder="YouTube URL"
                  />
                </div>
              )}
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
