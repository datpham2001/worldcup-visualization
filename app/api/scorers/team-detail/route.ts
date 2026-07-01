import { NextRequest, NextResponse } from 'next/server'
import { fetchAllMatches } from '@/lib/api/all-matches'
import { espnFetch, espnSiteUrl } from '@/lib/api/espn-client'
import { transformSummary } from '@/lib/transformers/summary.transformer'
import { LEAGUE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export interface TeamDetailPlayer {
  name: string
  goals: number
  assists: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: 'Missing teamId' }, { status: 400 })
  }

  const allMatches = await fetchAllMatches()
  const teamMatches = allMatches.filter(
    m =>
      m.status === 'post' &&
      (m.homeTeam?.id === teamId || m.awayTeam?.id === teamId),
  )

  // Fetch summaries for this team's matches only (max ~7 matches)
  const summaryResults = await Promise.allSettled(
    teamMatches.map(async m => {
      const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${m.id}`)
      const data = await espnFetch<unknown>(url, { cacheSeconds: 7200 })
      return { match: m, detail: transformSummary(data, m.id) }
    }),
  )

  // Aggregate goals and assists by player name
  const playerMap = new Map<string, { goals: number; assists: number }>()

  for (const result of summaryResults) {
    if (result.status !== 'fulfilled' || !result.value.detail) continue
    const { match, detail } = result.value

    for (const evt of detail.events || []) {
      // Only regular goals and penalties count (no own goals for team's players)
      if (evt.type !== 'goal' && evt.type !== 'penalty') continue

      // Determine which team scored
      const scoringTeamId =
        evt.team === 'home' ? match.homeTeam?.id : match.awayTeam?.id
      if (scoringTeamId !== teamId) continue

      // Credit goal to scorer
      if (evt.playerName) {
        const e = playerMap.get(evt.playerName) ?? { goals: 0, assists: 0 }
        e.goals++
        playerMap.set(evt.playerName, e)
      }

      // Credit assist
      if (evt.assistName) {
        const e = playerMap.get(evt.assistName) ?? { goals: 0, assists: 0 }
        e.assists++
        playerMap.set(evt.assistName, e)
      }
    }
  }

  const players: TeamDetailPlayer[] = Array.from(playerMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name))

  return NextResponse.json({ players }, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' },
  })
}
