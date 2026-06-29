import type { Scorer } from '@/types/scorers'
import { transformTeam } from './team.transformer'

interface ScorerAccum {
  goals: number
  assists: number
  penalties: number
  matchesPlayed: number
  athleteRaw: unknown
  teamRaw: unknown
}

export function transformScorer(accum: ScorerAccum, rank: number, sortBy: 'goals' | 'assists'): Scorer | null {
  try {
    const athlete = accum.athleteRaw as Record<string, unknown>
    const team = accum.teamRaw as Record<string, unknown>

    if (!athlete?.id) return null

    const photos = (athlete.headshot as Record<string, unknown> | undefined)
    const photoUrl = photos?.href as string | null || null

    return {
      rank,
      athlete: {
        id: athlete.id as string,
        name: athlete.displayName as string || '',
        shortName: athlete.shortName as string || '',
        displayName: athlete.displayName as string || '',
        photoUrl,
        position: null,
      },
      team: transformTeam(team || {}),
      goals: accum.goals,
      assists: accum.assists,
      penalties: accum.penalties,
      matchesPlayed: accum.matchesPlayed,
    }
  } catch {
    return null
  }
}
