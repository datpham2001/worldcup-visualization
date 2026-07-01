import { NextRequest, NextResponse } from 'next/server'
import { fetchAllMatches } from '@/lib/api/all-matches'
import { espnFetch, espnSiteUrl } from '@/lib/api/espn-client'
import { transformSummary } from '@/lib/transformers/summary.transformer'
import { LEAGUE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export interface PlayerMatchEvent {
  matchId: string
  date: string
  opponentName: string
  opponentAbbr: string
  opponentLogoUrl: string | null
  minute: number
  type: 'goal' | 'penalty' | 'assist'
  scoreSnapshot: string | null
  isHome: boolean
  homeTeamName: string
  awayTeamName: string
  homeScore: number | null
  awayScore: number | null
}

async function fetchSummaryEvents(matchId: string) {
  const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${matchId}`)
  try {
    const data = await espnFetch<unknown>(url, { cacheSeconds: 7200 })
    return transformSummary(data, matchId)
  } catch {
    return null
  }
}

// Normalize unicode + case for fuzzy name matching (both sources are ESPN displayName)
function nameMatches(a: string | undefined, b: string): boolean {
  if (!a) return false
  if (a === b) return true
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').trim()
  return norm(a) === norm(b)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const type = searchParams.get('type') as 'goals' | 'assists' | null

  if (!name || !type) {
    return NextResponse.json({ error: 'Missing name or type' }, { status: 400 })
  }

  const allMatches = await fetchAllMatches()
  const completed = allMatches.filter(m => m.status === 'post')

  // Fetch all completed match summaries in batches of 20
  const BATCH = 20
  const events: PlayerMatchEvent[] = []

  for (let i = 0; i < completed.length; i += BATCH) {
    const batch = completed.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(m => fetchSummaryEvents(m.id)))

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const match = batch[j]
      if (result.status !== 'fulfilled' || !result.value) continue

      const matchEvents = result.value.events || []

      for (const evt of matchEvents) {
        if (type === 'goals') {
          if ((evt.type === 'goal' || evt.type === 'penalty') && nameMatches(evt.playerName, name)) {
            const isHome = evt.team === 'home'
            const opponentTeam = isHome ? match.awayTeam : match.homeTeam
            events.push({
              matchId: match.id,
              date: match.date,
              opponentName: opponentTeam?.name || '?',
              opponentAbbr: opponentTeam?.abbreviation || '?',
              opponentLogoUrl: opponentTeam?.logoUrl || null,
              minute: evt.minute,
              type: evt.type === 'penalty' ? 'penalty' : 'goal',
              scoreSnapshot: evt.scoreSnapshot || null,
              isHome,
              homeTeamName: match.homeTeam?.name || '',
              awayTeamName: match.awayTeam?.name || '',
              homeScore: match.homeScore,
              awayScore: match.awayScore,
            })
          }
        } else {
          // assists: check assistName on goal/penalty events
          if (
            (evt.type === 'goal' || evt.type === 'penalty') &&
            nameMatches(evt.assistName, name)
          ) {
            const isHome = evt.team === 'home'
            const opponentTeam = isHome ? match.awayTeam : match.homeTeam
            events.push({
              matchId: match.id,
              date: match.date,
              opponentName: opponentTeam?.name || '?',
              opponentAbbr: opponentTeam?.abbreviation || '?',
              opponentLogoUrl: opponentTeam?.logoUrl || null,
              minute: evt.minute,
              type: 'assist',
              scoreSnapshot: evt.scoreSnapshot || null,
              isHome,
              homeTeamName: match.homeTeam?.name || '',
              awayTeamName: match.awayTeam?.name || '',
              homeScore: match.homeScore,
              awayScore: match.awayScore,
            })
          }
        }
      }
    }
  }

  // Sort by date ascending, then minute
  events.sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      a.minute - b.minute,
  )

  return NextResponse.json({ events }, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' },
  })
}
