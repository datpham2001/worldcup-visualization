import { cn } from '@/lib/utils'
import type { MatchEvent } from '@/types/match'

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  switch (type) {
    case 'goal': return <span className="text-base">⚽</span>
    case 'ownGoal': return <span className="text-base">⚽</span>
    case 'penalty': return <span className="text-base">⚽</span>
    case 'missedPenalty': return <span className="text-base">❌</span>
    case 'yellowCard': return <span className="text-xs">🟨</span>
    case 'redCard': return <span className="text-xs">🟥</span>
    case 'yellowRed': return <span className="text-xs">🟨🟥</span>
    case 'sub': return <span className="text-base">🔄</span>
    default: return <span>•</span>
  }
}

interface EventItemProps {
  event: MatchEvent
}

export function EventItem({ event }: EventItemProps) {
  const isHome = event.team === 'home'

  return (
    <div className={cn(
      'flex items-start gap-3 py-2',
      isHome ? 'flex-row' : 'flex-row-reverse'
    )}>
      {/* Minute badge */}
      <span className="text-xs font-mono text-text-muted w-8 shrink-0 pt-0.5 text-center">
        {event.minute}'
      </span>

      {/* Icon */}
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        <EventIcon type={event.type} />
      </div>

      {/* Player info */}
      <div className={cn('flex-1', isHome ? 'text-left' : 'text-right')}>
        <p className="text-sm font-medium text-text-primary">{event.playerName}</p>
        {event.assistName && (
          <p className="text-xs text-text-muted">Assist: {event.assistName}</p>
        )}
        {event.playerOutName && (
          <p className="text-xs text-text-muted">↑ {event.playerName} ↓ {event.playerOutName}</p>
        )}
        {event.type === 'ownGoal' && (
          <p className="text-xs text-accent-red">Own Goal</p>
        )}
        {event.scoreSnapshot && (
          <p className="text-xs font-mono text-accent-gold">{event.scoreSnapshot}</p>
        )}
      </div>
    </div>
  )
}
