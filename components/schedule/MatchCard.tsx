'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Match } from '@/types/match'
import { MapPin } from 'lucide-react'
import { useTimezone } from '@/lib/hooks/useTimezone'
import { fmtTime, fmtDate } from '@/lib/timezone'

// ─── Team column ──────────────────────────────────────────────────────────────
interface TeamColProps {
  match: Match
  side: 'home' | 'away'
  homeScore: number | null
  awayScore: number | null
  isDone: boolean
}

function TeamCol({ match, side, homeScore, awayScore, isDone }: TeamColProps) {
  const team     = side === 'home' ? match.homeTeam : match.awayTeam
  const score    = side === 'home' ? homeScore : awayScore
  const isWinner = isDone && (side === 'home' ? match.homeWinner : match.awayWinner)
  const isLoser  = isDone && (side === 'home' ? match.awayWinner : match.homeWinner)
  const isReverse = side === 'away'

  return (
    <div className={cn('flex-1 flex items-center gap-2 min-w-0', isReverse && 'flex-row-reverse')}>
      {/* Flag */}
      <div className={cn('shrink-0', isLoser && 'opacity-45')}>
        <TeamFlag logoUrl={team.logoUrl} name={team.name} size="md" />
      </div>

      {/* Name + winner badge */}
      <div className={cn('min-w-0', isReverse && 'text-right')}>
        <p className={cn(
          'text-[13px] font-semibold leading-tight truncate transition-colors',
          isWinner ? 'text-white' : isLoser ? 'text-text-muted' : 'text-text-primary',
        )}>
          {team.shortName || team.abbreviation}
        </p>
        {isWinner && (
          <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: '#e8b84b' }}>
            WINNER
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Score center ─────────────────────────────────────────────────────────────
function ScoreCenter({ match, isLive, isDone }: { match: Match; isLive: boolean; isDone: boolean }) {
  const { homeScore, awayScore, homeWinner, awayWinner, homePenaltyScore, awayPenaltyScore } = match
  if (!isLive && !isDone) {
    return <span className="text-text-muted font-mono text-xs font-bold tracking-wider px-1">VS</span>
  }

  const scoreColor = (wins: boolean, other: boolean) =>
    isLive ? 'text-white' : wins ? 'text-white' : other ? 'text-text-muted' : 'text-text-secondary'

  return (
    <div className="flex flex-col items-center shrink-0 px-2 gap-0.5">
      <div className="flex items-center gap-[3px]">
        <span className={cn('font-display text-[28px] leading-none tabular-nums', scoreColor(homeWinner, awayWinner))}>
          {homeScore ?? '0'}
        </span>
        <span className="text-text-muted font-mono text-sm pb-0.5">—</span>
        <span className={cn('font-display text-[28px] leading-none tabular-nums', scoreColor(awayWinner, homeWinner))}>
          {awayScore ?? '0'}
        </span>
      </div>
      {homePenaltyScore !== null && awayPenaltyScore !== null && (
        <span className="text-[10px] font-mono font-bold tracking-wide" style={{ color: '#e8b84b' }}>
          ({homePenaltyScore}–{awayPenaltyScore} pens)
        </span>
      )}
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: Match
  onMatchDetail?: (id: string) => void
}

export function MatchCard({ match, onMatchDetail }: MatchCardProps) {
  const { timezone } = useTimezone()
  const isLive = match.status === 'in'
  const isDone = match.status === 'post'
  const isPre  = match.status === 'pre'

  const cardInner = (
    <div className={cn(
      'relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer',
      'hover:shadow-lg hover:scale-[1.008]',
      isLive
        ? 'bg-[#170808] border-red-500/35 hover:border-red-500/55'
        : isDone
        ? 'bg-bg-surface border-border hover:border-white/12'
        : 'bg-bg-surface border-border hover:border-accent-blue/35',
    )}>
        {/* Live: animated top glow */}
        {isLive && (
          <div
            className="absolute top-0 left-0 right-0 h-[2px] animate-live-pulse"
            style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }}
          />
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2">
          {/* Status / time */}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />
              <span className="text-[11px] font-bold font-mono text-red-400 tracking-wider">
                {match.statusDisplay}
              </span>
            </div>
          )}
          {isDone && (
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
              style={match.statusDisplay !== 'FT'
                ? { background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.35)', color: '#e8b84b' }
                : { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
              }
            >
              {match.statusDisplay}
            </span>
          )}
          {isPre && (
            <span className="text-[13px] font-mono font-bold" style={{ color: '#e8b84b' }}>
              {fmtTime(match.date, timezone.tz, timezone.abbr)}
            </span>
          )}

          {/* Group / round label */}
          {(match.group || match.round) && (
            <span className="text-[11px] text-text-muted font-mono truncate max-w-[140px] ml-auto">
              {match.group || match.round}
            </span>
          )}
        </div>

        {/* ── Teams + Score ── */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <TeamCol match={match} side="home" homeScore={match.homeScore} awayScore={match.awayScore} isDone={isDone} />
            <ScoreCenter match={match} isLive={isLive} isDone={isDone} />
            <TeamCol match={match} side="away" homeScore={match.homeScore} awayScore={match.awayScore} isDone={isDone} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={cn(
          'flex items-center justify-between px-4 pb-3 pt-1.5 border-t gap-3',
          isLive ? 'border-red-500/10' : 'border-border/40',
        )}>
          <div className="flex items-center gap-1 text-[11px] text-text-muted min-w-0">
            <MapPin className="w-3 h-3 shrink-0 opacity-50" />
            <span className="truncate">{match.venueCity || match.venue || '—'}</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted shrink-0 whitespace-nowrap">
            {isDone
              ? `${fmtDate(match.date, timezone.tz)} · ${fmtTime(match.date, timezone.tz, timezone.abbr)}`
              : isPre
              ? fmtDate(match.date, timezone.tz)
              : ''}
          </span>
        </div>
      </div>
  )

  if (onMatchDetail) {
    return (
      <div onClick={() => onMatchDetail(match.id)}>
        {cardInner}
      </div>
    )
  }

  return (
    <Link href={`/matches/${match.id}`} className="block">
      {cardInner}
    </Link>
  )
}
