import type { Team } from '@/types/team'

export function transformTeam(raw: Record<string, unknown>): Team {
  const logos = (raw.logos as Array<Record<string, unknown>>) || []
  const logo = logos[0]?.href as string || ''
  const slug = raw.slug as string || (raw.abbreviation as string || '').toLowerCase()
  const logoUrl = logo || `https://a.espncdn.com/i/teamlogos/countries/500/${slug}.png`

  return {
    id: raw.id as string || '',
    name: raw.displayName as string || raw.name as string || '',
    shortName: raw.shortDisplayName as string || raw.abbreviation as string || '',
    abbreviation: raw.abbreviation as string || '',
    slug,
    color: raw.color as string || '1a1a2e',
    alternateColor: raw.alternateColor as string || '16213e',
    logoUrl,
  }
}
