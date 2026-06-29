import { fetchMatchSummary } from '@/lib/api/match-summary'
import { PageContainer } from '@/components/shared/PageContainer'
import { MatchHeader } from '@/components/match/MatchHeader'
import { MatchDetailTabs } from '@/components/match/MatchDetailTabs'
import { notFound } from 'next/navigation'

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  const match = await fetchMatchSummary(id)

  if (!match) notFound()

  return (
    <PageContainer>
      <MatchHeader match={match} />
      <div className="mt-6">
        <MatchDetailTabs match={match} />
      </div>
    </PageContainer>
  )
}
