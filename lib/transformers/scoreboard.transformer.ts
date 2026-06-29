import type { Match, MatchStatus } from '@/types/match'
import { transformTeam } from './team.transformer'

function humanRound(slug: string): string {
  const s = slug.toLowerCase()
  if (s.includes('group'))   return 'Group Stage'
  if (s.includes('32'))      return 'Round of 32'
  if (s.includes('16'))      return 'Round of 16'
  if (s.includes('quarter')) return 'Quarter-finals'
  if (s.includes('semi'))    return 'Semi-finals'
  if (s.includes('third') || s.includes('3rd') || s.includes('place')) return 'Third Place'
  if (s === 'final')         return 'Final'
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getStatus(event: Record<string, unknown>): MatchStatus {
  const status = event.status as Record<string, unknown> | undefined
  const typeState = (status?.type as Record<string, unknown> | undefined)?.state as string | undefined
  if (typeState === 'in') return 'in'
  if (typeState === 'post') return 'post'
  return 'pre'
}

function getStatusDisplay(event: Record<string, unknown>): string {
  const status = event.status as Record<string, unknown> | undefined
  const typeState = (status?.type as Record<string, unknown> | undefined)?.state as string | undefined
  const displayClock = (status?.type as Record<string, unknown> | undefined)?.shortDetail as string | undefined

  if (typeState === 'post') return 'FT'
  if (typeState === 'in') return displayClock || 'LIVE'

  const date = event.date as string | undefined
  if (date) {
    const d = new Date(date)
    const h = d.getUTCHours().toString().padStart(2, '0')
    const m = d.getUTCMinutes().toString().padStart(2, '0')
    return `${h}:${m} UTC`
  }
  return 'TBD'
}

export function transformEvent(raw: unknown): Match | null {
  try {
    const event = raw as Record<string, unknown>
    const competitions = (event.competitions as unknown[]) || []
    const competition = competitions[0] as Record<string, unknown> | undefined
    if (!competition) return null

    const competitors = (competition.competitors as unknown[]) || []
    const home = competitors.find(c => (c as Record<string, unknown>).homeAway === 'home') as Record<string, unknown> | undefined
    const away = competitors.find(c => (c as Record<string, unknown>).homeAway === 'away') as Record<string, unknown> | undefined
    if (!home || !away) return null

    const homeTeam = transformTeam((home.team as Record<string, unknown>) || {})
    const awayTeam = transformTeam((away.team as Record<string, unknown>) || {})

    const status = getStatus(event)
    const homeScore = status !== 'pre' ? Number((home.score as string) || '0') : null
    const awayScore = status !== 'pre' ? Number((away.score as string) || '0') : null

    const venue = competition.venue as Record<string, unknown> | undefined
    const venueFullName = venue?.fullName as string || ''
    const venueAddr = venue?.address as Record<string, unknown> | undefined
    const venueCity = venueAddr?.city as string || ''

    const notes = (competition.notes as Array<Record<string, unknown>>) || []
    const groupNote = notes.find(n => n.type === 'event')
    // Try comp.groups first (populated in summary API), then notes fallback
    const compGroups = competition.groups as Record<string, unknown> | undefined
    const groupFromGroups = compGroups?.abbreviation as string || compGroups?.name as string || null
    const group = groupFromGroups || groupNote?.headline as string | null || null

    const season = event.season as Record<string, unknown> | undefined
    const seasonType = season?.type as number | undefined
    const rawSlug = season?.slug as string || ''

    return {
      id: event.id as string,
      date: event.date as string,
      name: event.name as string || '',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      status,
      statusDisplay: getStatusDisplay(event),
      clock: (event.status as Record<string, unknown> | undefined)?.displayClock as string | null || null,
      venue: venueFullName,
      venueCity,
      group,
      round: humanRound(rawSlug) || 'Group Stage',
      seasonType: seasonType || 1,
    }
  } catch {
    return null
  }
}
