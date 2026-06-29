import { fetchScoreboard } from '@/lib/api/scoreboard'
import { fetchAllMatches } from '@/lib/api/all-matches'
import { PageContainer } from '@/components/shared/PageContainer'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ScheduleView } from '@/components/schedule/ScheduleView'

export const revalidate = 60

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
