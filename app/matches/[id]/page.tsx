import { fetchMatchSummary } from '@/lib/api/match-summary'
import { PageContainer } from '@/components/shared/PageContainer'
import { MatchHeader } from '@/components/match/MatchHeader'
import { MatchTimeline } from '@/components/match/MatchTimeline'
import { MatchStats } from '@/components/match/MatchStats'
import { MatchLineup } from '@/components/match/MatchLineup'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ErrorState } from '@/components/shared/ErrorState'
import { notFound } from 'next/navigation'

interface MatchPageProps {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  const match = await fetchMatchSummary(id)

  if (!match) notFound()

  const hasData = match.status !== 'pre'

  return (
    <PageContainer>
      <MatchHeader match={match} />

      {hasData ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Match Events
            </h3>
            <MatchTimeline
              events={match.events}
              homeTeamName={match.homeTeam.abbreviation}
              awayTeamName={match.awayTeam.abbreviation}
            />
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Match Stats
              </h3>
              <MatchStats stats={match.stats} />
            </div>
          </div>

          {/* Lineups - full width */}
          {(match.homeLineup.length > 0 || match.awayLineup.length > 0) && (
            <div className="lg:col-span-2 bg-bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Lineups
              </h3>
              <MatchLineup
                homeLineup={match.homeLineup}
                awayLineup={match.awayLineup}
                homeFormation={match.homeFormation}
                awayFormation={match.awayFormation}
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-bg-surface border border-border rounded-xl p-8 text-center text-text-muted text-sm">
          Match details will be available when the match begins.
        </div>
      )}
    </PageContainer>
  )
}
