import type { MatchDetail, MatchStatus } from '@/types/match'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformSummary } from '@/lib/transformers/summary.transformer'
import { REVALIDATE, LEAGUE } from '@/lib/constants'

export async function fetchMatchSummary(id: string): Promise<MatchDetail | null> {
  const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${id}`)

  const statusUrl = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard`)
  let isLive = false

  try {
    const sbData = await espnFetch<{ events: Array<{ id: string; status?: { type?: { state?: string } } }> }>(
      statusUrl, { cacheSeconds: 30 }
    )
    const event = (sbData.events || []).find(e => e.id === id)
    isLive = event?.status?.type?.state === 'in'
  } catch {
    // fall through
  }

  try {
    const data = await espnFetch<unknown>(url, isLive ? { noStore: true } : { cacheSeconds: REVALIDATE.MATCH_FINAL })
    return transformSummary(data, id)
  } catch {
    return null
  }
}
