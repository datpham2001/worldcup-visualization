export type MatchStatus = 'pre' | 'in' | 'post'

export interface Match {
  id: string
  date: string
  name: string
  homeTeam: import('./team').Team
  awayTeam: import('./team').Team
  homeScore: number | null
  awayScore: number | null
  status: MatchStatus
  statusDisplay: string
  clock: string | null
  venue: string
  venueCity: string
  group: string | null
  round: string
  seasonType: number
}

export interface MatchEvent {
  id: string
  type: 'goal' | 'ownGoal' | 'penalty' | 'missedPenalty' | 'yellowCard' | 'redCard' | 'yellowRed' | 'sub'
  minute: number
  team: 'home' | 'away'
  playerName: string
  playerOutName?: string
  assistName?: string
  scoreSnapshot?: string
}

export interface MatchStat {
  name: string
  displayName: string
  homeValue: number
  awayValue: number
  homeDisplay: string
  awayDisplay: string
}

export interface MatchPlayer {
  id: string
  name: string
  shortName: string
  number: string
  position: string
  starter: boolean
}

export interface MatchVideo {
  id: string
  headline: string
  thumbnail: string
  webLink: string
}

export interface MatchDetail extends Match {
  events: MatchEvent[]
  stats: MatchStat[]
  homeLineup: MatchPlayer[]
  awayLineup: MatchPlayer[]
  homeFormation: string
  awayFormation: string
  attendance: number | null
  referee: string | null
  videos: MatchVideo[]
}
