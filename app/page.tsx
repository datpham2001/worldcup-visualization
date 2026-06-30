import type { Metadata } from 'next'
import { fetchScoreboard } from '@/lib/api/scoreboard'
import { HeroPage } from '@/components/home/HeroPage'
import { JsonLd } from '@/components/shared/JsonLd'
import { toEspnDateParam } from '@/lib/utils'
import { BASE_URL, SITE_NAME, DEFAULT_DESCRIPTION, OG_IMAGE } from '@/lib/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'World Cup 2026 | Live Scores, Schedule & Standings',
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: `Live Scores & Schedule | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  alternates: { canonical: '/' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/schedule` },
    'query-input': 'required name=search_term_string',
  },
}

const sportsTournamentJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'FIFA World Cup 2026',
  sport: 'Soccer',
  url: 'https://www.fifa.com',
  location: [
    { '@type': 'Place', name: 'USA', addressCountry: 'US' },
    { '@type': 'Place', name: 'Canada', addressCountry: 'CA' },
    { '@type': 'Place', name: 'Mexico', addressCountry: 'MX' },
  ],
}

export default async function HomePage() {
  const today = new Date()
  const todayParam = toEspnDateParam(today.toISOString().split('T')[0])
  const todayMatches = await fetchScoreboard(todayParam)

  const liveCount = todayMatches.filter(m => m.status === 'in').length

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={sportsTournamentJsonLd} />
      <HeroPage
        todayCount={todayMatches.length}
        liveCount={liveCount}
      />
    </>
  )
}
