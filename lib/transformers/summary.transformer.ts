import type { MatchDetail, MatchEvent, MatchStat, MatchPlayer, MatchVideo } from '@/types/match'
import { transformEvent } from './scoreboard.transformer'

// ESPN summary keyEvents use type.type strings like "goal---volley", "yellow-card"
function mapEventType(typeStr: string, desc: string): MatchEvent['type'] | null {
  const t = typeStr.toLowerCase()
  const d = desc.toLowerCase()

  if (t.includes('yellow-red') || t.includes('secondyellow')) return 'yellowRed'
  if (t === 'yellow-card') return 'yellowCard'
  if (t === 'red-card') return 'redCard'
  if (t === 'own-goal') return 'ownGoal'
  if (t === 'penalty-miss') return 'missedPenalty'
  if (t === 'penalty-goal' || (t === 'penalty' && !d.includes('miss'))) return 'penalty'
  if (t.startsWith('goal') || t === 'goal') return 'goal'
  if (t.includes('substitut')) return 'sub'

  // Fallback: use the description text
  if (d.startsWith('goal!') || (d.includes('goal') && d.includes('scores'))) return 'goal'
  if (d.includes('yellow card') && !d.includes('second')) return 'yellowCard'
  if (d.includes('red card')) return 'redCard'
  if (d.includes('own goal')) return 'ownGoal'

  return null // skip kickoff, corner, foul, offside, shot, etc.
}

// Parse "90'+2'" or "54'" into minute number
function parseMinute(displayValue: string, clockValue: number): number {
  if (displayValue) {
    const m = displayValue.match(/^(\d+)(?:'?\+?'?(\d+))?/)
    if (m) return parseInt(m[1]) + (m[2] ? parseInt(m[2]) : 0)
  }
  if (clockValue > 0) return Math.floor(clockValue / 60)
  return 0
}

export function transformSummary(raw: unknown, matchId: string): MatchDetail | null {
  try {
    const data = raw as Record<string, unknown>
    const header = data.header as Record<string, unknown> | undefined

    const competitions = (header?.competitions as unknown[]) || []
    const comp = competitions[0] as Record<string, unknown> | undefined
    if (!comp) return null

    // Build baseEvent with correct status and date (both missing from header top-level)
    const baseEvent = {
      id: matchId,
      ...header,
      date: (comp.date as string) || '',
      status: comp.status,     // comp.status has the correct state (pre/in/post)
      competitions: [comp],
    }

    const baseMatch = transformEvent(baseEvent)
    if (!baseMatch) return null

    // Override round with the human-readable label from season.name
    // e.g. "2026 FIFA World Cup, Round of 32" → "Round of 32"
    const seasonName = (header?.season as Record<string, unknown> | undefined)?.name as string || ''
    const roundLabel = seasonName.includes(', ')
      ? seasonName.split(', ').slice(1).join(', ')
      : baseMatch.round

    // Override group from comp.groups (available in summary, not in scoreboard)
    const compGroups = comp.groups as Record<string, unknown> | undefined
    const groupLabel = compGroups?.abbreviation as string
      || compGroups?.name as string
      || baseMatch.group
      || null

    // Home team ID for homeAway determination in events
    const competitors = (comp.competitors as Array<Record<string, unknown>>) || []
    const homeComp = competitors.find(c => (c as Record<string, unknown>).homeAway === 'home')
    const homeTeamId = String(
      ((homeComp?.team as Record<string, unknown> | undefined)?.id) || ''
    )

    // Parse match events from keyEvents
    const incidents = (data.keyEvents as unknown[]) || []
    const events: MatchEvent[] = []

    for (const inc of incidents) {
      const incident = inc as Record<string, unknown>
      const period = incident.period as Record<string, unknown> | undefined
      const clock  = incident.clock  as Record<string, unknown> | undefined

      const incidentType = incident.type as Record<string, unknown> | undefined
      const typeStr = incidentType?.type as string || ''
      const desc    = incident.text as string || ''

      const eventType = mapEventType(typeStr, desc)
      if (!eventType) continue  // skip kickoff, foul, shot, etc.

      // Determine home/away from incident.team.id vs home team ID
      const incTeam = incident.team as Record<string, unknown> | undefined
      const incTeamId = String(incTeam?.id || '')
      const teamSide: 'home' | 'away' =
        incTeamId && homeTeamId && incTeamId === homeTeamId ? 'home' : 'away'

      // Participants: [scorer/main player, assister/secondary] — no type field
      const participants = (incident.participants as Array<Record<string, unknown>>) || []
      const p0 = participants[0]?.athlete as Record<string, unknown> | undefined
      const p1 = participants[1]?.athlete as Record<string, unknown> | undefined

      const minute = parseMinute(
        clock?.displayValue as string || '',
        Number(clock?.value || 0),
      )

      events.push({
        id: incident.id as string || String(Math.random()),
        type: eventType,
        minute,
        team: teamSide,
        playerName: p0?.displayName as string || p0?.shortName as string || '',
        playerOutName: eventType === 'sub' ? (p1?.displayName as string) : undefined,
        assistName: eventType !== 'sub' ? (p1?.displayName as string) : undefined,
        scoreSnapshot: incident.shortText as string || undefined,
      })
    }

    // Parse stats
    const boxscore = data.boxscore as Record<string, unknown> | undefined
    const statGroups = (boxscore?.teams as Array<Record<string, unknown>>) || []
    const statsMap = new Map<string, { home: string; away: string; homeVal: number; awayVal: number; label: string }>()

    statGroups.forEach((teamGroup, idx) => {
      const isHome   = teamGroup.homeAway === 'home' || idx === 0
      const statistics = (teamGroup.statistics as Array<Record<string, unknown>>) || []
      for (const stat of statistics) {
        const key     = stat.name as string || ''
        const display = stat.displayValue as string || ''
        const label   = stat.label as string || key
        const val     = Number(stat.value ?? 0)
        const existing = statsMap.get(key) || { home: '', away: '', homeVal: 0, awayVal: 0, label }
        if (isHome) statsMap.set(key, { ...existing, home: display, homeVal: val, label })
        else        statsMap.set(key, { ...existing, away: display, awayVal: val })
      }
    })

    const stats: MatchStat[] = Array.from(statsMap.entries()).map(([name, vals]) => ({
      name,
      displayName: vals.label || name.replace(/([A-Z])/g, ' $1').trim(),
      homeValue:   vals.homeVal,
      awayValue:   vals.awayVal,
      homeDisplay: vals.home,
      awayDisplay: vals.away,
    }))

    // Parse lineups from data.rosters (top-level, NOT boxscore.players)
    const dataRosters = (data.rosters as Array<Record<string, unknown>>) || []

    const mapRoster = (rosterEntry: Record<string, unknown>): MatchPlayer[] => {
      const players: MatchPlayer[] = []
      for (const player of (rosterEntry.roster as Array<Record<string, unknown>>) || []) {
        const a = player.athlete as Record<string, unknown> | undefined
        if (!a) continue
        players.push({
          id:        String(a.id || ''),
          name:      a.displayName as string || '',
          shortName: a.shortName as string || a.displayName as string || '',
          number:    player.jersey as string || '',
          position:  (player.position as Record<string, unknown> | undefined)?.abbreviation as string || '',
          starter:   player.starter as boolean || false,
        })
      }
      return players
    }

    const homeRosterEntry = dataRosters.find(r => (r.homeAway as string) === 'home') ?? dataRosters[0]
    const awayRosterEntry = dataRosters.find(r => (r.homeAway as string) === 'away') ?? dataRosters[1]
    const homeLineup = homeRosterEntry ? mapRoster(homeRosterEntry) : []
    const awayLineup = awayRosterEntry ? mapRoster(awayRosterEntry) : []

    // Parse formation
    const homeRosterFormation = (homeRosterEntry?.formation as string) || ''
    const awayRosterFormation = (awayRosterEntry?.formation as string) || ''
    const compForHome = competitors.find(c => (c as Record<string, unknown>).homeAway === 'home')
    const compForAway = competitors.find(c => (c as Record<string, unknown>).homeAway === 'away')
    const homeFormation = homeRosterFormation || compForHome?.formation as string || ''
    const awayFormation = awayRosterFormation || compForAway?.formation as string || ''

    // Parse highlight videos
    const rawVideos = (data.videos as Array<Record<string, unknown>>) || []
    const videos: MatchVideo[] = rawVideos.slice(0, 8).flatMap(v => {
      const links = v.links as Record<string, unknown> | undefined
      const web   = links?.web as Record<string, unknown> | undefined
      const href  = web?.href as string || ''
      if (!href) return []
      const thumb = v.thumbnail as string || ''
      return [{
        id:        String(v.id || v.headline || ''),
        headline:  v.headline as string || 'Highlight',
        thumbnail: thumb.startsWith('https://') ? thumb : '',
        webLink:   href,
      }]
    })

    return {
      ...baseMatch,
      round:       roundLabel,
      group:       groupLabel,
      events:      events.slice(0, 60),
      stats,
      homeLineup,
      awayLineup,
      homeFormation,
      awayFormation,
      attendance:  comp.attendance as number | null || null,
      referee:     null,
      videos,
    }
  } catch {
    return null
  }
}
