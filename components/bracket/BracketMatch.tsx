'use client'

import { cn } from '@/lib/utils'
import { TeamFlag } from '@/components/shared/TeamFlag'
import { Maximize2 } from 'lucide-react'
import type { BracketMatch as BM, BracketMatchTeam } from '@/types/bracket'
import type { PredictionSide } from '@/lib/hooks/usePredictions'

/**
 * normal  – no team selected, default appearance
 * active  – selected team is IN this match (team played / is playing here)
 * route   – on the projected path but team hasn't played here yet (TBD slot)
 * dim     – off the route; fade to ghost
 */
export type RouteState = 'normal' | 'active' | 'route' | 'dim'

// ─── TeamRow ──────────────────────────────────────────────────────────────────

interface TeamRowProps {
  entry: BracketMatchTeam
  isTop: boolean
  isDone: boolean
  isLive: boolean
  isPre: boolean
  isHighlighted: boolean
  isPredicted: boolean
  predictionResult: 'correct' | 'wrong' | null
  onClick: () => void
}

function TeamRow({
  entry, isTop, isDone, isLive, isPre,
  isHighlighted, isPredicted, predictionResult, onClick,
}: TeamRowProps) {
  const isWinner = entry.winner
  const isLoser  = isDone && !isWinner && entry.team !== null

  return (
    <button
      onClick={onClick}
      disabled={!entry.team}
      className={cn(
        'group w-full flex items-center gap-2 text-left transition-all duration-150',
        'px-2.5 py-[6px]',
        isTop && 'border-b border-white/6',
        isWinner && 'border-l-2 border-l-[#e8b84b]',
        isPredicted && !isDone && 'border-l-2 border-l-amber-400/50',
        isHighlighted
          ? 'bg-[#4090ff]/12'
          : isWinner
          ? 'hover:bg-[#e8b84b]/8'
          : 'hover:bg-white/4',
        !entry.team && 'cursor-default',
      )}
    >
      {entry.team ? (
        <>
          {/* Flag */}
          <div className={cn('shrink-0 transition-opacity', isLoser && 'opacity-30')}>
            <TeamFlag logoUrl={entry.team.logoUrl} name={entry.team.name} size="sm" />
          </div>

          {/* Name */}
          <span className={cn(
            'flex-1 text-[11px] font-semibold truncate leading-none',
            isWinner
              ? 'text-white'
              : isLoser
              ? 'text-white/28'
              : 'text-white/65',
            isHighlighted && 'text-[#90bbff]',
          )}>
            {entry.team.abbreviation}
          </span>

          {/* Hover affordance: show "★ Predict" for unpredicted future slots */}
          {isPre && !isPredicted && (
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0 text-[9px] text-amber-400/70 shrink-0 leading-none whitespace-nowrap pointer-events-none">
              ★ Predict
            </span>
          )}

          {/* Prediction star for upcoming matches */}
          {isPredicted && isPre && (
            <span className="text-[9px] text-amber-400 shrink-0 leading-none" title="Your prediction">
              ★
            </span>
          )}

          {/* Prediction result for completed matches */}
          {predictionResult === 'correct' && (
            <span className="text-[10px] shrink-0 leading-none" title="Correct prediction!">✅</span>
          )}
          {predictionResult === 'wrong' && (
            <span className="text-[10px] shrink-0 leading-none opacity-60" title="Wrong prediction">❌</span>
          )}

          {/* Score */}
          {entry.score !== null && (
            <span className={cn(
              'text-[13px] font-bold tabular-nums shrink-0 leading-none',
              isWinner ? 'text-[#e8b84b]' : 'text-white/30',
            )}>
              {entry.score}
            </span>
          )}

          {/* Blue dot for selected team */}
          {isHighlighted && (
            <span className="w-[5px] h-[5px] rounded-full bg-[#4090ff] shrink-0 ml-0.5 animate-pulse" />
          )}
        </>
      ) : (
        <>
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/8 shrink-0" />
          <span className="flex-1 text-[10px] text-white/18 italic tracking-wide">TBD</span>
        </>
      )}
    </button>
  )
}

// ─── BracketMatchBox ──────────────────────────────────────────────────────────

export interface BracketMatchBoxProps {
  match: BM
  routeState: RouteState
  selectedTeamId: string | null
  onSelectTeam: (id: string | null) => void
  wide?: boolean
  prediction?: PredictionSide
  onPredict?: (side: PredictionSide) => void
  onMatchDetail?: () => void
}

export function BracketMatchBox({
  match, routeState, selectedTeamId, onSelectTeam, wide,
  prediction, onPredict, onMatchDetail,
}: BracketMatchBoxProps) {
  const isLive = match.status === 'in'
  const isDone = match.status === 'post'
  const isPre  = match.status === 'pre'

  const homeHl = !!match.home.team && match.home.team.id === selectedTeamId
  const awayHl = !!match.away.team && match.away.team.id === selectedTeamId

  const toggle = (teamId: string) =>
    onSelectTeam(selectedTeamId === teamId ? null : teamId)

  // Prediction state per team
  const homePredicted = prediction === 'home'
  const awayPredicted = prediction === 'away'

  const homeResult: 'correct' | 'wrong' | null = (isDone && homePredicted)
    ? (match.home.winner ? 'correct' : 'wrong')
    : null
  const awayResult: 'correct' | 'wrong' | null = (isDone && awayPredicted)
    ? (match.away.winner ? 'correct' : 'wrong')
    : null

  const canPredict = isPre && !!match.home.team && !!match.away.team

  const handleHomeClick = () => {
    if (match.home.team) {
      toggle(match.home.team.id)
      if (canPredict) onPredict?.('home')
    }
  }

  const handleAwayClick = () => {
    if (match.away.team) {
      toggle(match.away.team.id)
      if (canPredict) onPredict?.('away')
    }
  }

  const W = wide ? 168 : 152

  return (
    <div
      className={cn(
        'group/card relative rounded-[6px] overflow-hidden transition-all duration-300',
        routeState === 'active' &&
          'border border-[#4090ff]/70 shadow-[0_0_18px_rgba(64,144,255,0.22)]',
        routeState === 'route' &&
          'border border-dashed border-[#4090ff]/38',
        routeState === 'normal' &&
          'border border-white/8 hover:border-white/16',
        routeState === 'dim' &&
          'border border-white/4 opacity-18',
        isLive && routeState !== 'dim' &&
          'border border-red-500/55 shadow-[0_0_12px_rgba(239,68,68,0.14)]',
      )}
      style={{ width: W }}
    >
      {/* Live pulse bar */}
      {isLive && (
        <div
          className="h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"
          style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
        />
      )}

      {/* Route accent */}
      {(routeState === 'active' || routeState === 'route') && !isLive && (
        <div
          className={cn(
            'h-[2px] bg-gradient-to-r from-transparent to-transparent',
            routeState === 'active' ? 'via-[#4090ff]' : 'via-[#4090ff]/45',
          )}
        />
      )}

      {/* Prediction hint bar for predictable future matches */}
      {canPredict && !prediction && (
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      )}

      {/* Info button — appears on hover, opens detail drawer */}
      {onMatchDetail && (
        <button
          onClick={(e) => { e.stopPropagation(); onMatchDetail() }}
          className="absolute top-1 right-1 z-10 w-[18px] h-[18px] rounded flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-150 text-white/40 hover:text-white/90 hover:bg-white/12"
          title="Match details"
        >
          <Maximize2 className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Card background */}
      <div className="bg-[#0d1929]">
        <TeamRow
          entry={match.home} isTop isDone={isDone} isLive={isLive} isPre={isPre}
          isHighlighted={homeHl}
          isPredicted={homePredicted}
          predictionResult={homeResult}
          onClick={handleHomeClick}
        />
        <TeamRow
          entry={match.away} isTop={false} isDone={isDone} isLive={isLive} isPre={isPre}
          isHighlighted={awayHl}
          isPredicted={awayPredicted}
          predictionResult={awayResult}
          onClick={handleAwayClick}
        />
      </div>
    </div>
  )
}
