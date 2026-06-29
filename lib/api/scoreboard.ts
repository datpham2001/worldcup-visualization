import type { Match } from '@/types/match'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformEvent } from '@/lib/transformers/scoreboard.transformer'
import { REVALIDATE, LEAGUE } from '@/lib/constants'

export async function fetchScoreboard(date?: string): Promise<Match[]> {
  const params = date ? `?dates=${date}` : ''
  const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard${params}`)

  try {
    const data = await espnFetch<{ events: unknown[] }>(url, { cacheSeconds: REVALIDATE.SCOREBOARD })
    const events = data.events || []
    return events.map(transformEvent).filter((m): m is Match => m !== null)
  } catch {
    return []
  }
}
