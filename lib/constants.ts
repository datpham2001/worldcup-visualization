export const ESPN_BASE = 'https://site.api.espn.com'
export const ESPN_CORE = 'https://sports.core.api.espn.com'
export const LEAGUE = 'fifa.world'

export const REVALIDATE = {
  SCOREBOARD: 60,
  STANDINGS: 300,
  MATCH_FINAL: 3600,
  BRACKET: 300,
  TEAMS: 86400,
  SCORERS: 600,
} as const

export const ROUND_LABELS: Record<number, { id: string; label: string; shortLabel: string }> = {
  2: { id: 'r32', label: 'Round of 32', shortLabel: 'R32' },
  3: { id: 'r16', label: 'Round of 16', shortLabel: 'R16' },
  4: { id: 'qf', label: 'Quarter-finals', shortLabel: 'QF' },
  5: { id: 'sf', label: 'Semi-finals', shortLabel: 'SF' },
  6: { id: '3rd', label: 'Third Place', shortLabel: '3rd' },
  7: { id: 'final', label: 'Final', shortLabel: 'Final' },
}
