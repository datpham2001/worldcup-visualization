import type { Metadata } from 'next'
import { fetchScoreboard } from '@/lib/api/scoreboard'
import { fetchAllMatches } from '@/lib/api/all-matches'
import { PageContainer } from '@/components/shared/PageContainer'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ScheduleView } from '@/components/schedule/ScheduleView'
import { OG_IMAGE } from '@/lib/seo'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Match Schedule',
  description: 'Full FIFA World Cup 2026 match schedule. Filter by group stage, knockout rounds, live matches, and teams. Live score updates every 30 seconds.',
  openGraph: {
    title: 'FIFA World Cup 2026 Match Schedule — All Fixtures',
    description: 'Complete schedule of all 104 World Cup 2026 matches. Live scores updated every 30 seconds.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: '/schedule' },
}

export default async function SchedulePage() {
  const [todayMatches, allMatches] = await Promise.all([
    fetchScoreboard(),
    fetchAllMatches(),
  ])

  return (
    <PageContainer>
      <SectionHeading
        title="Match Schedule"
        subtitle="FIFA World Cup 2026 · All fixtures · Times in ICT (Vietnam)"
      />
      <ScheduleView initialToday={todayMatches} initialAll={allMatches} />
    </PageContainer>
  )
}
