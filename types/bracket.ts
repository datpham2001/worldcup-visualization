import type { Team } from './team'
import type { MatchStatus } from './match'

export type BracketRoundId = 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'

export interface BracketMatchTeam {
  team: Team | null
  score: number | null
  winner: boolean
}

export interface BracketMatch {
  id: string
  roundId: BracketRoundId
  position: number
  home: BracketMatchTeam
  away: BracketMatchTeam
  status: MatchStatus
  date: string | null
  isTbd: boolean
}

export interface BracketRound {
  id: BracketRoundId
  label: string
  shortLabel: string
  matches: BracketMatch[]
}

export interface BracketData {
  rounds: BracketRound[]
}
