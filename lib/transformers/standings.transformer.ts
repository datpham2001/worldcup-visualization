import type { Group, StandingRow, QualificationNote } from '@/types/standings'
import { transformTeam } from './team.transformer'

function getNote(raw: Record<string, unknown>): QualificationNote {
  const note = raw.note as Record<string, unknown> | undefined
  const color = note?.color as string | undefined
  if (!color) return null
  if (color === '009900' || color === '00cc00' || color.includes('green')) return 'advanced'
  if (color === 'ffcc00' || color.includes('yellow')) return 'playoff'
  return null
}

function getStat(stats: Array<Record<string, unknown>>, name: string): number {
  const s = stats.find(s => s.name === name || s.abbreviation === name)
  return Number(s?.value || 0)
}

function getStatDisplay(stats: Array<Record<string, unknown>>, name: string): string {
  const s = stats.find(s => s.name === name || s.abbreviation === name)
  return s?.displayValue as string || '0'
}

export function transformStandingsEntry(raw: unknown): Group | null {
  try {
    const group = raw as Record<string, unknown>
    const standings = group.standings as Record<string, unknown> | undefined
    const entries = (standings?.entries as unknown[]) || []

    const rows: StandingRow[] = entries.map((e) => {
      const entry = e as Record<string, unknown>
      const team = transformTeam(entry.team as Record<string, unknown> || {})
      const stats = (entry.stats as Array<Record<string, unknown>>) || []
      return {
        rank: 0, // assigned after sort
        team,
        gamesPlayed: getStat(stats, 'gamesPlayed'),
        wins: getStat(stats, 'wins'),
        draws: getStat(stats, 'ties'),
        losses: getStat(stats, 'losses'),
        goalsFor: getStat(stats, 'pointsFor'),
        goalsAgainst: getStat(stats, 'pointsAgainst'),
        goalDifference: getStat(stats, 'pointDifferential'),
        points: getStat(stats, 'points'),
        note: getNote(entry as Record<string, unknown>),
      }
    })

    rows.sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
    )
    rows.forEach((r, i) => { r.rank = i + 1 })

    return {
      id: group.id as string || '',
      name: group.name as string || group.abbreviation as string || '',
      abbreviation: group.abbreviation as string || '',
      entries: rows,
    }
  } catch {
    return null
  }
}
