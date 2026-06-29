import type { Team } from './team'

export type QualificationNote = 'advanced' | 'playoff' | 'eliminated' | null

export interface StandingRow {
  rank: number
  team: Team
  gamesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  note: QualificationNote
}

export interface Group {
  id: string
  name: string
  abbreviation: string
  entries: StandingRow[]
}
