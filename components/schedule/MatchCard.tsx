'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Match } from '@/types/match'
import { MapPin } from 'lucide-react'

// ─── Time helpers (Vietnam = UTC+7) ──────────────────────────────────────────
function vnTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }) + ' ICT'
}

function vnDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

// ─── Team column ──────────────────────────────────────────────────────────────
interface TeamColProps {
  match: Match
  side: 'home' | 'away'
  homeScore: number | null
  awayScore: number | null
  isDone: boolean
}

function TeamCol({ match, side, homeScore, awayScore, isDone }: TeamColProps) {
  const team  = side === 'home' ? match.homeTeam : match.awayTeam
  const score = side === 'home' ? homeScore : awayScore
  const otherScore = side === 'home' ? awayScore : homeScore
  const isWinner = isDone && score !== null && otherScore !== null && score > otherScore
  const isLoser  = isDone && score !== null && otherScore !== null && score < otherScore
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
  const { homeScore, awayScore } = match
  if (!isLive && !isDone) {
    return <span className="text-text-muted font-mono text-xs font-bold tracking-wider px-1">VS</span>
  }

  const homeWins = isDone && homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayWins = isDone && homeScore !== null && awayScore !== null && awayScore > homeScore

  const scoreColor = (wins: boolean, other: boolean) =>
    isLive ? 'text-white' : wins ? 'text-white' : other ? 'text-text-muted' : 'text-text-secondary'

  return (
    <div className="flex items-center gap-[3px] shrink-0 px-2">
      <span className={cn('font-display text-[28px] leading-none tabular-nums', scoreColor(homeWins, awayWins))}>
        {homeScore ?? '0'}
      </span>
      <span className="text-text-muted font-mono text-sm pb-0.5">—</span>
      <span className={cn('font-display text-[28px] leading-none tabular-nums', scoreColor(awayWins, homeWins))}>
        {awayScore ?? '0'}
      </span>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: Match
  onMatchDetail?: (id: string) => void
}

export function MatchCard({ match, onMatchDetail }: MatchCardProps) {
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
            <span className="text-[11px] font-mono text-text-muted bg-bg-elevated border border-border px-2 py-0.5 rounded-full">
              FT
            </span>
          )}
          {isPre && (
            <span className="text-[13px] font-mono font-bold" style={{ color: '#e8b84b' }}>
              {vnTime(match.date)}
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
              ? `${vnDate(match.date)} · ${vnTime(match.date)}`
              : isPre
              ? vnDate(match.date)
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
