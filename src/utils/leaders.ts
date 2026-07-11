import type { LeaderProfile, LeadershipRole } from '../types'

export const LEADERSHIP_ROLES: LeadershipRole[] = [
  'School Captain',
  'Vice Captain',
  'Senior Prefect',
  'Sports Captain',
  'Media Prefect',
  'Prefect',
]

export const ROLE_DISPLAY_ORDER: LeadershipRole[] = [...LEADERSHIP_ROLES]

export const EXEC_ROLES: LeadershipRole[] = [
  'School Captain',
  'Vice Captain',
  'Senior Prefect',
  'Sports Captain',
]

export function roleToSlug(role: LeadershipRole): string {
  return role.toLowerCase().replace(/\s+/g, '-')
}

export function isExecRole(role: LeadershipRole): boolean {
  return EXEC_ROLES.includes(role)
}

export function normalizeRole(role: LeadershipRole | string | undefined): LeadershipRole {
  if (role && LEADERSHIP_ROLES.includes(role as LeadershipRole)) {
    return role as LeadershipRole
  }
  return 'Prefect'
}

export function sortLeadersForDisplay(leaders: LeaderProfile[]): LeaderProfile[] {
  const roleRank = new Map(ROLE_DISPLAY_ORDER.map((role, index) => [role, index]))

  return [...leaders].sort((a, b) => {
    const roleA = roleRank.get(normalizeRole(a.role)) ?? ROLE_DISPLAY_ORDER.length
    const roleB = roleRank.get(normalizeRole(b.role)) ?? ROLE_DISPLAY_ORDER.length
    if (roleA !== roleB) return roleA - roleB
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
}
