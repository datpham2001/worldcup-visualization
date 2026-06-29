import type { Match } from '@/types/match'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformEvent } from '@/lib/transformers/scoreboard.transformer'
import { LEAGUE } from '@/lib/constants'

// WC 2026: June 11 – July 19
const WEEK_STARTS = ['20260611', '20260618', '20260625', '20260702', '20260709', '20260716']
const TOURNAMENT_END = '20260719'

function offsetDate(yyyymmdd: string, days: number): string {
  const y = +yyyymmdd.slice(0, 4)
  const m = +yyyymmdd.slice(4, 6) - 1
  const d = +yyyymmdd.slice(6, 8)
  const date = new Date(Date.UTC(y, m, d + days))
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

async function fetchRange(start: string, end: string, cacheSeconds: number): Promise<Match[]> {
  // Try range format — ESPN may accept "YYYYMMDD-YYYYMMDD"
  try {
    const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${start}-${end}`)
    const data = await espnFetch<{ events?: unknown[] }>(url, { cacheSeconds })
    if (data.events && data.events.length > 0) {
      return data.events.map(transformEvent).filter((m): m is Match => m !== null)
    }
  } catch { /* fall through */ }

  // Fallback: fetch each day individually (capped to tournament end)
  const days: string[] = []
  for (let i = 0; i <= 6; i++) {
    const d = offsetDate(start, i)
    if (d <= end && d <= TOURNAMENT_END) days.push(d)
  }

  const results = await Promise.allSettled(
    days.map(async (day) => {
      const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${day}`)
      const data = await espnFetch<{ events?: unknown[] }>(url, { cacheSeconds })
      return (data.events || []).map(transformEvent).filter((m): m is Match => m !== null)
    }),
  )

  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

export async function fetchAllMatches(): Promise<Match[]> {
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '')

  const tasks = WEEK_STARTS.map((start) => {
    const rawEnd = offsetDate(start, 6)
    const end = rawEnd > TOURNAMENT_END ? TOURNAMENT_END : rawEnd
    // Past weeks: cache aggressively; current/future: short cache
    const isPast = end < todayStr
    return fetchRange(start, end, isPast ? 3600 : 90)
  })

  const results = await Promise.allSettled(tasks)

  const seen = new Set<string>()
  const all: Match[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const match of result.value) {
        if (!seen.has(match.id)) {
          seen.add(match.id)
          all.push(match)
        }
      }
    }
  }

  return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
