import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useEditMode } from '../../context/EditModeContext'
import { ModalPortal } from '../ModalPortal'
import { useScrollLock } from '../../hooks/useScrollLock'
import type { VideoItem } from '../../types'
import { getYoutubeEmbedUrl } from '../../utils/youtube'
import { formatReleaseLabel, isVideoLocked, toISODate } from '../../utils/videoRelease'

interface TheatreStageProps {
  videos: VideoItem[]
  onUpdateVideos: (videos: VideoItem[]) => void
}

const METAL_TIERS = ['silver', 'bronze', 'gold'] as const

function Curtain({ side, open }: { side: 'left' | 'right'; open: boolean }) {
  return (
    <motion.div
      className={`curtain curtain--${side}`}
      initial={false}
      animate={{ x: open ? (side === 'left' ? '-95%' : '95%') : 0 }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="curtain__fabric">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="curtain__fold" />
        ))}
      </div>
      <div className="curtain__valance" />
    </motion.div>
  )
}

function UnlockButton({ onUnlock }: { onUnlock: () => void }) {
  return (
    <motion.div
      className="theatre__unlock-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="theatre__unlock-glow"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.button
        className="theatre__unlock-btn theatre__unlock-btn--gold"
        onClick={onUnlock}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
      >
        <span className="theatre__unlock-btn-text">Unlock</span>
        <motion.span
          className="metal-shine"
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
      </motion.button>
    </motion.div>
  )
}

function VideoCard({
  video,
  index,
  isEditMode,
  isLocked,
  activeVideoId,
  onSelect,
  onUpdate,
}: {
  video: VideoItem
  index: number
  isEditMode: boolean
  isLocked: boolean
  activeVideoId: string | null
  onSelect: () => void
  onUpdate: (video: VideoItem) => void
}) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [shake, setShake] = useState(0)
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tier = METAL_TIERS[index] ?? 'gold'
  const releaseDate = video.releaseDate ?? toISODate(new Date())
  const releaseLabel = formatReleaseLabel(video)

  useEffect(() => {
    if (activeVideoId !== video.id) {
      setIsFlipping(false)
    }
  }, [activeVideoId, video.id])

  useEffect(() => {
    return () => {
      if (flipTimer.current) clearTimeout(flipTimer.current)
    }
  }, [])

  const handleClick = () => {
    if (isLocked) {
      setShake((s) => s + 1)
      return
    }
    setIsFlipping(true)
    flipTimer.current = setTimeout(() => onSelect(), 500)
  }

  return (
    <motion.div
      className="video-card-wrap"
      initial={{ opacity: 0, y: 60, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.4 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        className={`video-card video-card--${tier} ${isLocked ? 'video-card--locked' : ''}`}
        onClick={handleClick}
        whileHover={isLocked ? {} : { y: -8, scale: 1.02 }}
        animate={
          isFlipping
            ? { rotateY: 90, scale: 0.95 }
            : shake > 0
              ? { x: [-8, 8, -6, 6, 0], rotateY: 0, scale: 1 }
              : { rotateY: 0, scale: 1 }
        }
        transition={{ duration: isFlipping ? 0.5 : 0.4 }}
        key={shake}
        style={{ transformStyle: 'preserve-3d' }}
        disabled={isFlipping}
      >
        <div className={`video-card__frame video-card__frame--${tier}`}>
          <motion.span
            className="metal-shine"
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 + index * 0.4 }}
          />
          <div className={`video-card__inner video-card__inner--${tier}`}>
            <span className="video-card__icon">{video.emoji || '🎬'}</span>
            <h3 className="video-card__title">{video.title}</h3>

            <p className="video-card__countdown">{releaseLabel}</p>

            {isLocked && <span className="video-card__lock">🔒</span>}

            {!isLocked && (
              <span className="video-card__play-hint">Click to watch</span>
            )}
          </div>
        </div>
      </motion.button>

      {isEditMode && (
        <div className="video-card__edit">
          <div className="video-card__edit-emoji">
            <label>Emoji</label>
            <input
              className="edit-input edit-input--emoji"
              value={video.emoji ?? ''}
              onChange={(e) => onUpdate({ ...video, emoji: e.target.value })}
              placeholder="🎬"
              maxLength={4}
            />
          </div>
          <input
            className="edit-input"
            value={video.title}
            onChange={(e) => onUpdate({ ...video, title: e.target.value })}
            placeholder="Card title"
          />
          <input
            className="edit-input"
            value={video.youtubeUrl}
            onChange={(e) => onUpdate({ ...video, youtubeUrl: e.target.value })}
            placeholder="YouTube URL"
          />
          <div className="video-card__edit-days">
            <label>Release date</label>
            <input
              type="date"
              className="edit-input edit-input--small"
              value={releaseDate}
              onChange={(e) => onUpdate({ ...video, releaseDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function VideoTheatreOverlay({
  video,
  onClose,
}: {
  video: VideoItem
  onClose: () => void
}) {
  const embedUrl = getYoutubeEmbedUrl(video.youtubeUrl)

  useScrollLock(true)

  return (
    <ModalPortal>
      <motion.div
        className="video-theatre-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="video-theatre-overlay__content"
        initial={{ scale: 0.6, rotateY: -90, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ scale: 0.8, rotateY: 90, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          className="video-theatre-overlay__close"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
        >
          ×
        </motion.button>

        <div className="video-theatre-overlay__curtains">
          <div className="video-theatre-overlay__curtain video-theatre-overlay__curtain--left" />
          <div className="video-theatre-overlay__curtain video-theatre-overlay__curtain--right" />
        </div>

        <div className="video-theatre-overlay__marquee">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="marquee-bulb"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>

        <div className="video-theatre-overlay__proscenium">
          <div className="video-theatre-overlay__gold-trim" />
          <div className="video-theatre-overlay__screen">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="video-frame__placeholder">Video unavailable</div>
            )}
            <motion.div
              className="video-theatre-overlay__spotlight"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>

        <motion.h2
          className="video-theatre-overlay__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {video.emoji} {video.title}
        </motion.h2>

        <motion.button
          className="video-theatre-overlay__back"
          onClick={onClose}
          whileHover={{ x: -4 }}
        >
          ← Back to Selection
        </motion.button>
      </motion.div>
      </motion.div>
    </ModalPortal>
  )
}

export function TheatreStage({ videos, onUpdateVideos }: TheatreStageProps) {
  const { isEditMode } = useEditMode()
  const stageRef = useRef(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const updateVideo = (updated: VideoItem) => {
    onUpdateVideos(videos.map((v) => (v.id === updated.id ? { ...v, ...updated, emoji: updated.emoji ?? v.emoji ?? '🎬' } : v)))
  }

  const activeVideo = videos.find((v) => v.id === activeVideoId)

  const isVideoLockedForView = (video: VideoItem) => {
    if (isEditMode) return false
    return isVideoLocked(video)
  }

  return (
    <div className="theatre" ref={stageRef}>
      <div className="theatre__ceiling">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="theatre__chandelier-light"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        className="theatre__marquee"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="theatre__marquee-lights">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="marquee-bulb"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
        <h1 className="theatre__marquee-text">Featured Prefect Videos</h1>
      </motion.div>

      <div className="theatre__stage-wrap">
        <Curtain side="left" open={isUnlocked} />
        <Curtain side="right" open={isUnlocked} />

        <motion.div
          className="theatre__stage-floor"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        <AnimatePresence>
          {!isUnlocked && <UnlockButton onUnlock={() => setIsUnlocked(true)} />}
        </AnimatePresence>

        {isUnlocked && (
          <motion.div
            className="theatre__cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {videos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={{ ...video, emoji: video.emoji ?? '🎬' }}
                index={i}
                isEditMode={isEditMode}
                isLocked={isVideoLockedForView(video)}
                activeVideoId={activeVideoId}
                onSelect={() => setActiveVideoId(video.id)}
                onUpdate={updateVideo}
              />
            ))}
          </motion.div>
        )}

        <motion.div
          className="theatre__spotlight theatre__spotlight--left"
          animate={{ opacity: isUnlocked ? [0.3, 0.7, 0.3] : [0.15, 0.3, 0.15], x: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="theatre__spotlight theatre__spotlight--right"
          animate={{ opacity: isUnlocked ? [0.3, 0.7, 0.3] : [0.15, 0.3, 0.15], x: [20, -20, 20] }}
          transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        />
      </div>

      <AnimatePresence>
        {activeVideo && (
          <VideoTheatreOverlay
            video={{ ...activeVideo, emoji: activeVideo.emoji ?? '🎬' }}
            onClose={() => setActiveVideoId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
