import type { Group } from '@/types/standings'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformStandingsEntry } from '@/lib/transformers/standings.transformer'
import { REVALIDATE, LEAGUE } from '@/lib/constants'

export async function fetchStandings(): Promise<Group[]> {
  const url = espnSiteUrl(`/apis/v2/sports/soccer/${LEAGUE}/standings`)

  try {
    const data = await espnFetch<{ children?: unknown[] }>(url, { cacheSeconds: REVALIDATE.STANDINGS })
    const children = data.children || []
    return children.map(transformStandingsEntry).filter((g): g is Group => g !== null)
  } catch {
    return []
  }
}
