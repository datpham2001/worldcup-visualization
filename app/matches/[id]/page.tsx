import type { Metadata } from 'next'
import { fetchMatchSummary } from '@/lib/api/match-summary'
import { PageContainer } from '@/components/shared/PageContainer'
import { MatchHeader } from '@/components/match/MatchHeader'
import { MatchDetailTabs } from '@/components/match/MatchDetailTabs'
import { JsonLd } from '@/components/shared/JsonLd'
import { notFound } from 'next/navigation'
import { BASE_URL, OG_IMAGE } from '@/lib/seo'

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params
  const match = await fetchMatchSummary(id)
  if (!match) return {}

  const home = match.homeTeam.shortName || match.homeTeam.abbreviation
  const away = match.awayTeam.shortName || match.awayTeam.abbreviation
  const isDone = match.status === 'post'
  const isLive = match.status === 'in'

  let title: string
  let description: string

  if (isDone) {
    title = `${home} ${match.homeScore ?? 0}–${match.awayScore ?? 0} ${away} | ${match.round}`
    description = `Full match report: ${match.homeTeam.name} vs ${match.awayTeam.name} — ${match.round}, FIFA World Cup 2026. Final score: ${match.homeScore}–${match.awayScore}.`
  } else if (isLive) {
    title = `LIVE: ${home} ${match.homeScore ?? 0}–${match.awayScore ?? 0} ${away}`
    description = `Live score: ${match.homeTeam.name} vs ${match.awayTeam.name} — ${match.round}, FIFA World Cup 2026. Watch live updates now.`
  } else {
    title = `${home} vs ${away} | ${match.round}`
    description = `${match.homeTeam.name} vs ${match.awayTeam.name} — ${match.round}, FIFA World Cup 2026. Match preview and lineup.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [OG_IMAGE],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/matches/${id}` },
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  const match = await fetchMatchSummary(id)

  if (!match) notFound()

  const isDone = match.status === 'post'
  const isLive = match.status === 'in'
  const eventStatus = isDone
    ? 'https://schema.org/EventPostponed'
    : isLive
    ? 'https://schema.org/EventScheduled'
    : 'https://schema.org/EventScheduled'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: match.date,
    sport: 'Soccer',
    eventStatus,
    location: {
      '@type': 'Place',
      name: match.venue || 'FIFA World Cup 2026 Venue',
      address: { '@type': 'PostalAddress', addressLocality: match.venueCity || '' },
    },
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam.name },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam.name },
    organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
    ...(isDone && match.homeScore !== null && {
      subEvent: [{
        '@type': 'Event',
        name: 'Full Time Result',
        description: `${match.homeTeam.name} ${match.homeScore}–${match.awayScore} ${match.awayTeam.name}`,
      }],
    }),
    url: `${BASE_URL}/matches/${match.id}`,
  }

  return (
    <PageContainer>
      <JsonLd data={jsonLd} />
      <MatchHeader match={match} />
      <div className="mt-6">
        <MatchDetailTabs match={match} />
      </div>
    </PageContainer>
  )
}
