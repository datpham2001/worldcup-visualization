import type { Metadata } from 'next'
import { fetchAllMatches } from '@/lib/api/all-matches'
import { fetchStandings } from '@/lib/api/standings'
import { PageContainer } from '@/components/shared/PageContainer'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { TournamentBracket } from '@/components/bracket/TournamentBracket'
import { OG_IMAGE } from '@/lib/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Tournament Bracket',
  description: 'Interactive FIFA World Cup 2026 knockout bracket. Follow every team from the Round of 32 through to the Final. Click teams to trace their path.',
  openGraph: {
    title: 'FIFA World Cup 2026 Tournament Bracket',
    description: 'Interactive knockout bracket — R32 through to the Final. Updated live.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: '/bracket' },
}

export default async function BracketPage() {
  const [allMatches, groups] = await Promise.all([
    fetchAllMatches(),
    fetchStandings(),
  ])

  return (
    <PageContainer className="overflow-hidden px-0 sm:px-0">
      <div className="px-4 md:px-8 mb-6">
        <SectionHeading
          title="Tournament Bracket"
          subtitle="Knockout stage · R32 → Final · Click any team to trace their path"
        />
      </div>
      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden mx-4 md:mx-8">
        <TournamentBracket initialMatches={allMatches} groups={groups} />
      </div>
    </PageContainer>
  )
}
