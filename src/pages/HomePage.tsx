import { motion } from 'framer-motion'
import { useState } from 'react'
import { useEditMode } from '../context/EditModeContext'
import { useSiteDataContext } from '../context/SiteDataContext'
import { LeaderProfiles } from '../components/home/LeaderProfiles'
import { LeaderModal } from '../components/home/LeaderModal'
import { TeamCarousel } from '../components/home/TeamCarousel'
import type { LeaderProfile } from '../types'

export function HomePage() {
  const { data, updateData } = useSiteDataContext()
  const { isEditMode } = useEditMode()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedLeader = data.leaders.find((leader) => leader.id === selectedId) ?? null

  const handleUpdateLeaders = (leaders: LeaderProfile[]) => {
    updateData((site) => ({ ...site, leaders }))
  }

  const handleSaveLeader = (updated: LeaderProfile) => {
    handleUpdateLeaders(data.leaders.map((leader) => (leader.id === updated.id ? updated : leader)))
    setSelectedId(updated.id)
  }

  const handleDeleteLeader = (id: string) => {
    handleUpdateLeaders(data.leaders.filter((leader) => leader.id !== id))
    setSelectedId(null)
  }

  return (
    <div className="home-page home-page--space">
      <div className="home-page__stars" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.span
            key={i}
            className="home-page__star"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0.15, 0.9, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2.5 + (i % 5),
              repeat: Infinity,
              delay: (i % 7) * 0.3,
            }}
          />
        ))}
      </div>

      <section className="home-hero">
        <TeamCarousel
          images={data.teamCarouselImages}
          leaders={data.leaders}
          onUpdateImages={(teamCarouselImages) =>
            updateData((site) => ({ ...site, teamCarouselImages }))
          }
          onUpdateLeaders={handleUpdateLeaders}
          onSelectLeader={setSelectedId}
        />
      </section>

      <section className="home-profiles">
        {isEditMode ? (
          <>
            <input
              className="edit-input home-profiles__title-input"
              value={data.homepageTitle}
              onChange={(e) =>
                updateData((site) => ({ ...site, homepageTitle: e.target.value }))
              }
            />
            <input
              className="edit-input home-profiles__slogan-input"
              value={data.homepageSlogan}
              onChange={(e) =>
                updateData((site) => ({ ...site, homepageSlogan: e.target.value }))
              }
              placeholder="Slogan"
            />
          </>
        ) : (
          <>
            <motion.h1
              className="home-profiles__title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {data.homepageTitle}
            </motion.h1>
            <motion.p
              className="home-profiles__slogan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {data.homepageSlogan}
            </motion.p>
          </>
        )}

        <LeaderProfiles leaders={data.leaders} onSelectLeader={setSelectedId} />
      </section>

      {selectedLeader && (
        <LeaderModal
          leader={selectedLeader}
          onClose={() => setSelectedId(null)}
          isEditMode={isEditMode}
          onSave={handleSaveLeader}
          onDelete={isEditMode ? () => handleDeleteLeader(selectedLeader.id) : undefined}
        />
      )}
    </div>
  )
}
