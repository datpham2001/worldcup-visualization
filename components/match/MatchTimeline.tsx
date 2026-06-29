import { EventItem } from './EventItem'
import type { MatchEvent } from '@/types/match'

interface MatchTimelineProps {
  events: MatchEvent[]
  homeTeamName: string
  awayTeamName: string
}

export function MatchTimeline({ events, homeTeamName, awayTeamName }: MatchTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No events recorded</p>
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute)

  return (
    <div>
      {/* Team labels */}
      <div className="flex justify-between text-xs font-semibold text-text-muted mb-3 px-11">
        <span>{homeTeamName}</span>
        <span>{awayTeamName}</span>
      </div>
      {/* Center line */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-px" />
        <div className="space-y-1">
          {sorted.map(event => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}
