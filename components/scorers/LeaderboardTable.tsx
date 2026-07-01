import { PlayerRow } from './PlayerRow'
import { TeamStatRow } from './TeamStatRow'
import type { Scorer, TeamStat } from '@/types/scorers'

interface PlayerTableProps {
  scorers: Scorer[]
  highlightStat: 'goals' | 'assists'
  mode: 'players'
  enhancedPhotos?: Record<string, string | null>
  onPlayerClick?: (scorer: Scorer) => void
}

interface TeamTableProps {
  teams: TeamStat[]
  mode: 'teams'
  onTeamClick?: (stat: TeamStat) => void
}

type Props = PlayerTableProps | TeamTableProps

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-text-muted text-sm">{text}</div>
  )
}

export function LeaderboardTable(props: Props) {
  if (props.mode === 'teams') {
    if (props.teams.length === 0) {
      return <EmptyState text="No team stats available yet" />
    }
    return (
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        {props.teams.map((stat, i) => (
          <TeamStatRow
            key={stat.team.id}
            stat={stat}
            index={i}
            onClick={props.onTeamClick ? () => props.onTeamClick!(stat) : undefined}
          />
        ))}
      </div>
    )
  }

  if (props.scorers.length === 0) {
    return <EmptyState text="No data available yet" />
  }
  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {props.scorers.map((scorer, i) => (
        <PlayerRow
          key={scorer.athlete.id}
          scorer={scorer}
          highlightStat={props.highlightStat}
          index={i}
          enhancedPhotoUrl={props.enhancedPhotos?.[scorer.athlete.id]}
          onClick={props.onPlayerClick ? () => props.onPlayerClick!(scorer) : undefined}
        />
      ))}
    </div>
  )
}
