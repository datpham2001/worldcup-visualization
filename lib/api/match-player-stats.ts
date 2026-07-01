import { fetchAllMatches } from './all-matches'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformSummary } from '@/lib/transformers/summary.transformer'
import { LEAGUE } from '@/lib/constants'

export interface PlayerEventStats {
  goals: number
  assists: number
  matchesPlayed: number
}

async function fetchSummaryForMatch(matchId: string) {
  const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${matchId}`)
  try {
    const data = await espnFetch<unknown>(url, { cacheSeconds: 7200 })
    return transformSummary(data, matchId)
  } catch {
    return null
  }
}

function normName(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').trim()
}

/**
 * Aggregates goals and assists for every player from actual match event data.
 * This is the authoritative real-time source — more accurate than ESPN's /statistics
 * endpoint which can lag behind actual results.
 *
 * Completed match summaries are cached for 2 hours, so warm requests are fast (~50ms).
 */
export async function fetchPlayerStatsFromEvents(): Promise<Map<string, PlayerEventStats>> {
  const allMatches = await fetchAllMatches()
  const completed = allMatches.filter(m => m.status === 'post')

  const statsMap = new Map<string, PlayerEventStats>()
  // Track which matches each player appeared in (for matchesPlayed)
  const playerMatches = new Map<string, Set<string>>()

  const BATCH = 20
  for (let i = 0; i < completed.length; i += BATCH) {
    const batch = completed.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(m => fetchSummaryForMatch(m.id)))

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const match = batch[j]
      if (result.status !== 'fulfilled' || !result.value) continue

      for (const evt of result.value.events || []) {
        // Only count regular goals and penalties (not own goals, not missed penalties)
        if (evt.type !== 'goal' && evt.type !== 'penalty') continue

        // Count goal for scorer
        if (evt.playerName) {
          const key = normName(evt.playerName)
          const e = statsMap.get(key) ?? { goals: 0, assists: 0, matchesPlayed: 0 }
          e.goals++
          statsMap.set(key, e)

          if (!playerMatches.has(key)) playerMatches.set(key, new Set())
          playerMatches.get(key)!.add(match.id)
        }

        // Count assist
        if (evt.assistName) {
          const key = normName(evt.assistName)
          const e = statsMap.get(key) ?? { goals: 0, assists: 0, matchesPlayed: 0 }
          e.assists++
          statsMap.set(key, e)

          if (!playerMatches.has(key)) playerMatches.set(key, new Set())
          playerMatches.get(key)!.add(match.id)
        }
      }
    }
  }

  // Fill matchesPlayed from unique match IDs
  for (const [key, matchSet] of playerMatches) {
    const e = statsMap.get(key)
    if (e) e.matchesPlayed = matchSet.size
  }

  return statsMap
}
