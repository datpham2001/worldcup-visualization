import type { Metadata } from 'next'
import { fetchStandings } from '@/lib/api/standings'
import { PageContainer } from '@/components/shared/PageContainer'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { GroupGrid } from '@/components/standings/GroupGrid'
import { ErrorState } from '@/components/shared/ErrorState'
import { OG_IMAGE } from '@/lib/seo'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Group Standings',
  description: 'Live FIFA World Cup 2026 group stage standings. Track wins, draws, losses, goal difference, and points for all 12 groups.',
  openGraph: {
    title: 'FIFA World Cup 2026 Group Standings',
    description: 'Live group standings — wins, draws, losses, goal difference, and points for all 12 groups.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: '/standings' },
}

export default async function StandingsPage() {
  const groups = await fetchStandings()

  return (
    <PageContainer>
      <SectionHeading
        title="Group Standings"
        subtitle="GP · W · D · L · GD · GF · Points"
      />
      {groups.length === 0 ? (
        <ErrorState message="Standings data not available" />
      ) : (
        <GroupGrid groups={groups} />
      )}
      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-green" /> Advances
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-yellow" /> Best third-place
        </span>
      </div>
    </PageContainer>
  )
}
