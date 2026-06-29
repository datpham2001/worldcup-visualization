import type { Team } from './team'

export interface Scorer {
  rank: number
  athlete: {
    id: string
    name: string
    shortName: string
    displayName: string
    photoUrl: string | null
    position: string | null
  }
  team: Team
  goals: number
  assists: number
  penalties: number
  matchesPlayed: number
}

export interface TeamStat {
  rank: number
  team: Team
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  points: number
}
