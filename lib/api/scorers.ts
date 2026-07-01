import type { Scorer, TeamStat } from '@/types/scorers'
import { espnFetch, espnSiteUrl } from './espn-client'
import { transformTeam } from '@/lib/transformers/team.transformer'
import { fetchAllMatches } from './all-matches'
import { fetchPlayerStatsFromEvents } from './match-player-stats'
import { LEAGUE } from '@/lib/constants'

// WC 2026 week batches for scoreboard team-data mapping
const WEEK_STARTS = ['20260611', '20260618', '20260625', '20260702', '20260709', '20260716']
const TOURNAMENT_END = '20260719'

function offsetDate(yyyymmdd: string, days: number): string {
  const y = +yyyymmdd.slice(0, 4), m = +yyyymmdd.slice(4, 6) - 1, d = +yyyymmdd.slice(6, 8)
  return new Date(Date.UTC(y, m, d + days)).toISOString().split('T')[0].replace(/-/g, '')
}

// ─── ESPN /statistics endpoint (goals + assists, headshots) ──────────────────

interface StatLeader {
  value: number
  displayValue: string
  athlete: {
    id: string
    displayName: string
    shortName: string
    headshot: { href: string } | null
    position: { abbreviation: string } | null
    jersey: string | null
    team?: Record<string, unknown> | null
  }
}

interface StatCategory {
  name: string
  displayName: string
  leaders: StatLeader[]
}

async function fetchStatisticsLeaders(): Promise<{ goals: StatLeader[]; assists: StatLeader[] }> {
  const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/statistics`)
  try {
    const data = await espnFetch<{ stats?: StatCategory[] }>(url, { cacheSeconds: 30 })
    const stats = data.stats || []
    const goalsCategory   = stats.find(s => s.name === 'goalsLeaders')
    const assistsCategory = stats.find(s => s.name === 'assistsLeaders')
    return {
      goals:   (goalsCategory?.leaders   || []) as StatLeader[],
      assists: (assistsCategory?.leaders || []) as StatLeader[],
    }
  } catch {
    return { goals: [], assists: [] }
  }
}

// ─── Scoreboard: build athleteId → full team mapping ─────────────────────────

async function buildAthleteTeamMap(): Promise<Map<string, Record<string, unknown>>> {
  const teamMap = new Map<string, Record<string, unknown>>()
  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '')

  const tasks = WEEK_STARTS.map(async (start) => {
    const rawEnd = offsetDate(start, 6)
    const end    = rawEnd > TOURNAMENT_END ? TOURNAMENT_END : rawEnd
    const cacheSeconds = end < todayStr ? 3600 : 90

    try {
      const url = espnSiteUrl(`/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${start}-${end}`)
      const sbData = await espnFetch<{ events?: unknown[] }>(url, { cacheSeconds })

      const events = (sbData.events || []) as Array<{
        competitions?: Array<{
          competitors?: Array<{
            team?: Record<string, unknown>
            leaders?: Array<{
              name?: string
              leaders?: Array<{ athlete?: Record<string, unknown> }>
            }>
          }>
        }>
      }>

      for (const event of events) {
        for (const comp of event.competitions || []) {
          for (const competitor of comp.competitors || []) {
            const team = competitor.team as Record<string, unknown> | undefined
            if (!team?.id) continue
            for (const leaderCat of competitor.leaders || []) {
              for (const leader of leaderCat.leaders || []) {
                const athleteId = (leader.athlete as Record<string, unknown> | undefined)?.id as string | undefined
                if (athleteId && !teamMap.has(athleteId)) {
                  teamMap.set(athleteId, team)
                }
              }
            }
          }
        }
      }
    } catch { /* skip */ }
  })

  await Promise.allSettled(tasks)
  return teamMap
}

// ─── Parse stats from displayValue ───────────────────────────────────────────

function parseDisplayValue(dv: string): { matches: number; goals: number; assists: number } {
  const num = (key: string) => {
    const m = new RegExp(`${key}:\\s*(\\d+)`, 'i').exec(dv)
    return m ? parseInt(m[1]) : 0
  }
  return { matches: num('Matches'), goals: num('Goals'), assists: num('Assists') }
}

function normalizeName(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '').trim()
}

// ─── Build Scorer from StatLeader ─────────────────────────────────────────────

function buildScorer(
  leader: StatLeader,
  rank: number,
  mode: 'goals' | 'assists',
  teamMap: Map<string, Record<string, unknown>>,
  crossStats?: Map<string, { goals: number; assists: number; matches: number }>,
  // Match-event aggregation: more accurate than ESPN /statistics (which can lag)
  eventStats?: Map<string, { goals: number; assists: number; matchesPlayed: number }>,
): Scorer | null {
  const ath = leader.athlete
  if (!ath?.id) return null

  const parsed = parseDisplayValue(leader.displayValue || '')
  const teamRaw = (ath.team && Object.keys(ath.team).length > 0 ? ath.team : null)
    ?? teamMap.get(ath.id)
    ?? null
  if (!teamRaw) return null

  const team = transformTeam(teamRaw)
  const photoUrl = ath.headshot?.href || null

  const cross = crossStats?.get(ath.id)
  // Prefer match-event counts (real-time, counted from match summaries) over
  // ESPN's /statistics endpoint (known to lag several goals behind).
  const eventEntry = eventStats?.get(normalizeName(ath.displayName))

  const goals   = eventEntry?.goals   ?? (mode === 'goals'   ? Math.round(leader.value) : (cross?.goals   ?? parsed.goals   ?? 0))
  const assists = eventEntry?.assists ?? (mode === 'assists' ? Math.round(leader.value) : (cross?.assists  ?? parsed.assists ?? 0))
  const matches = eventEntry?.matchesPlayed ?? cross?.matches ?? parsed.matches ?? 0

  return {
    rank,
    athlete: {
      id: ath.id,
      name: ath.displayName,
      shortName: ath.shortName,
      displayName: ath.displayName,
      photoUrl,
      position: ath.position?.abbreviation || null,
    },
    team,
    goals,
    assists,
    penalties: 0,
    matchesPlayed: matches,
  }
}

// ─── Team stats from completed matches ───────────────────────────────────────

async function fetchTeamStats(): Promise<TeamStat[]> {
  const matches = await fetchAllMatches()
  const completed = matches.filter(m => m.status === 'post')

  const teamMap = new Map<string, {
    team: NonNullable<typeof completed[0]['homeTeam']>
    goalsFor: number; goalsAgainst: number
    wins: number; draws: number; losses: number
    matchesPlayed: number; points: number
  }>()

  for (const m of completed) {
    if (!m.homeTeam?.id || !m.awayTeam?.id) continue
    const hScore = m.homeScore ?? 0
    const aScore = m.awayScore ?? 0

    for (const [teamObj, scored, conceded] of [
      [m.homeTeam, hScore, aScore] as const,
      [m.awayTeam, aScore, hScore] as const,
    ]) {
      const id = teamObj.id
      const e  = teamMap.get(id) ?? {
        team: teamObj, goalsFor: 0, goalsAgainst: 0,
        wins: 0, draws: 0, losses: 0, matchesPlayed: 0, points: 0,
      }
      e.goalsFor     += scored
      e.goalsAgainst += conceded
      e.matchesPlayed += 1
      if      (scored > conceded)  { e.wins   += 1; e.points += 3 }
      else if (scored === conceded) { e.draws  += 1; e.points += 1 }
      else                          { e.losses += 1 }
      teamMap.set(id, e)
    }
  }

  return Array.from(teamMap.values())
    .sort((a, b) => b.goalsFor - a.goalsFor || b.wins - a.wins || a.goalsAgainst - b.goalsAgainst)
    .slice(0, 24)
    .map((e, i) => ({
      rank: i + 1, team: e.team,
      goalsFor: e.goalsFor, goalsAgainst: e.goalsAgainst,
      goalDifference: e.goalsFor - e.goalsAgainst,
      matchesPlayed: e.matchesPlayed,
      wins: e.wins, draws: e.draws, losses: e.losses, points: e.points,
    }))
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchScorers(): Promise<{
  goals: Scorer[]
  assists: Scorer[]
  teams: TeamStat[]
}> {
  try {
    const [statLeaders, teamMap, teams, eventStats] = await Promise.all([
      fetchStatisticsLeaders(),
      buildAthleteTeamMap(),
      fetchTeamStats(),
      fetchPlayerStatsFromEvents(),
    ])

    // Cross-reference ESPN goals + assists leader lists so secondary stats are filled.
    // (ESPN displayValue only contains the primary stat for each category.)
    const crossStats = new Map<string, { goals: number; assists: number; matches: number }>()

    for (const leader of statLeaders.goals) {
      if (!leader.athlete?.id) continue
      const parsed = parseDisplayValue(leader.displayValue || '')
      const e = crossStats.get(leader.athlete.id) ?? { goals: 0, assists: 0, matches: 0 }
      e.goals   = Math.round(leader.value)
      e.matches = Math.max(e.matches, parsed.matches || 0)
      crossStats.set(leader.athlete.id, e)
    }

    for (const leader of statLeaders.assists) {
      if (!leader.athlete?.id) continue
      const parsed = parseDisplayValue(leader.displayValue || '')
      const e = crossStats.get(leader.athlete.id) ?? { goals: 0, assists: 0, matches: 0 }
      e.assists = Math.round(leader.value)
      e.matches = Math.max(e.matches, parsed.matches || 0)
      crossStats.set(leader.athlete.id, e)
    }

    // Build scorers with event-based counts, then re-sort & re-rank so the
    // corrected totals determine the final leaderboard order.
    const goals = statLeaders.goals
      .map((l, i) => buildScorer(l, i + 1, 'goals', teamMap, crossStats, eventStats))
      .filter((s): s is Scorer => s !== null)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 20)
      .map((s, i) => ({ ...s, rank: i + 1 }))

    const assists = statLeaders.assists
      .map((l, i) => buildScorer(l, i + 1, 'assists', teamMap, crossStats, eventStats))
      .filter((s): s is Scorer => s !== null)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 20)
      .map((s, i) => ({ ...s, rank: i + 1 }))

    return { goals, assists, teams }
  } catch {
    return { goals: [], assists: [], teams: [] }
  }
}
