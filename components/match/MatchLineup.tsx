import { cn } from '@/lib/utils'
import type { MatchPlayer } from '@/types/match'

interface LineupColumnProps {
  players: MatchPlayer[]
  alignment: 'left' | 'right'
}

function LineupColumn({ players, alignment }: LineupColumnProps) {
  const starters = players.filter(p => p.starter)
  const subs = players.filter(p => !p.starter)

  const PlayerRow = ({ player }: { player: MatchPlayer }) => (
    <div className={cn(
      'flex items-center gap-2 py-1.5 border-b border-border-subtle last:border-0',
      alignment === 'right' && 'flex-row-reverse'
    )}>
      <span className="text-xs font-mono text-text-muted w-5 text-center shrink-0">{player.number}</span>
      <span className="text-sm text-text-primary truncate">{player.shortName || player.name}</span>
      {player.position && (
        <span className="text-xs text-text-muted shrink-0">{player.position}</span>
      )}
    </div>
  )

  return (
    <div>
      <div className="mb-2">
        {starters.map(p => <PlayerRow key={p.id} player={p} />)}
      </div>
      {subs.length > 0 && (
        <>
          <p className="text-xs text-text-muted font-semibold py-1.5">Substitutes</p>
          {subs.map(p => <PlayerRow key={p.id} player={p} />)}
        </>
      )}
    </div>
  )
}

interface MatchLineupProps {
  homeLineup: MatchPlayer[]
  awayLineup: MatchPlayer[]
  homeFormation: string
  awayFormation: string
  homeTeamName: string
  awayTeamName: string
}

export function MatchLineup({ homeLineup, awayLineup, homeFormation, awayFormation, homeTeamName, awayTeamName }: MatchLineupProps) {
  if (homeLineup.length === 0 && awayLineup.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">Lineups not yet available</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-semibold text-text-primary">{homeTeamName}</h4>
          {homeFormation && <span className="text-xs font-mono text-text-muted">{homeFormation}</span>}
        </div>
        <LineupColumn players={homeLineup} alignment="left" />
      </div>
      <div>
        <div className="flex items-center justify-end gap-2 mb-3">
          {awayFormation && <span className="text-xs font-mono text-text-muted">{awayFormation}</span>}
          <h4 className="text-sm font-semibold text-text-primary">{awayTeamName}</h4>
        </div>
        <LineupColumn players={awayLineup} alignment="right" />
      </div>
    </div>
  )
}
