import { TeamFlag } from '@/components/shared/TeamFlag'
import { MatchStatusBadge } from '@/components/shared/MatchStatusBadge'
import type { MatchDetail } from '@/types/match'
import { MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface MatchHeaderProps {
  match: MatchDetail
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const homeWon = match.status === 'post' && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore
  const awayWon = match.status === 'post' && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore

  return (
    <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-3 bg-bg-elevated border-b border-border flex items-center justify-between">
        <span className="text-xs text-text-muted">{match.group || match.round}</span>
        <MatchStatusBadge status={match.status} statusDisplay={match.statusDisplay} />
      </div>

      {/* Main score area */}
      <div className="px-6 py-8 flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-center gap-3 text-center">
          <TeamFlag logoUrl={match.homeTeam.logoUrl} name={match.homeTeam.name} size="xl" />
          <div>
            <p className="text-lg font-bold text-text-primary">{match.homeTeam.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{match.homeTeam.abbreviation}</p>
          </div>
          {match.homeFormation && (
            <span className="text-xs bg-bg-elevated px-2 py-0.5 rounded-full text-text-muted font-mono">
              {match.homeFormation}
            </span>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {match.status !== 'pre' ? (
            <div className="flex items-center gap-2">
              <span className="font-display text-7xl leading-none text-text-primary"
                style={{ textShadow: homeWon ? '0 0 40px rgba(34, 197, 94, 0.3)' : undefined }}>
                {match.homeScore}
              </span>
              <span className="font-display text-4xl text-text-muted">:</span>
              <span className="font-display text-7xl leading-none text-text-primary"
                style={{ textShadow: awayWon ? '0 0 40px rgba(34, 197, 94, 0.3)' : undefined }}>
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-2xl text-text-secondary">VS</span>
              <span className="text-sm text-text-muted font-mono">{match.statusDisplay}</span>
            </div>
          )}
          {match.status === 'in' && match.clock && (
            <span className="text-sm text-accent-red font-mono animate-live-pulse">{match.clock}</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-center gap-3 text-center">
          <TeamFlag logoUrl={match.awayTeam.logoUrl} name={match.awayTeam.name} size="xl" />
          <div>
            <p className="text-lg font-bold text-text-primary">{match.awayTeam.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{match.awayTeam.abbreviation}</p>
          </div>
          {match.awayFormation && (
            <span className="text-xs bg-bg-elevated px-2 py-0.5 rounded-full text-text-muted font-mono">
              {match.awayFormation}
            </span>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-6 py-3 border-t border-border flex items-center justify-center gap-6 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(match.date)}
        </span>
        {match.venue && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {match.venue}
            {match.venueCity && `, ${match.venueCity}`}
          </span>
        )}
        {match.attendance && (
          <span>Attendance: {match.attendance.toLocaleString()}</span>
        )}
      </div>
    </div>
  )
}
