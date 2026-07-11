import { motion } from 'framer-motion'
import type { LeaderProfile } from '../../types'
import { roleToSlug, sortLeadersForDisplay } from '../../utils/leaders'

interface LeaderProfilesProps {
  leaders: LeaderProfile[]
  onSelectLeader: (id: string) => void
}

export function LeaderProfiles({ leaders, onSelectLeader }: LeaderProfilesProps) {
  const sortedLeaders = sortLeadersForDisplay(leaders)

  return (
    <div className="leader-profiles">
      <div className="leaders-grid">
        {sortedLeaders.map((leader, i) => (
          <motion.button
            key={leader.id}
            type="button"
            className={`leader-card leader-card--${roleToSlug(leader.role)}`}
            onClick={() => onSelectLeader(leader.id)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            whileHover={{ y: -8 }}
          >
            <div className="leader-card__orbit" />
            <div className="leader-card__image-wrap">
              <img src={leader.profilePicUrl} alt={leader.name} />
            </div>
            <span className="leader-card__role">{leader.role}</span>
            <h3>{leader.name}</h3>
            <p>
              {leader.description.slice(0, 90)}
              {leader.description.length > 90 ? '…' : ''}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
