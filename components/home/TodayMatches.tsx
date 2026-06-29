'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Match } from '@/types/match'
import { cn } from '@/lib/utils'
import { ArrowRight, MapPin } from 'lucide-react'

interface MatchTileProps {
  match: Match
  index: number
}

function MatchTile({ match, index }: MatchTileProps) {
  const isLive = match.status === 'in'
  const isDone = match.status === 'post'
  const hasScore = isLive || isDone

  const homeWins = isDone && (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWins = isDone && (match.awayScore ?? 0) > (match.homeScore ?? 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 w-[280px] sm:w-[300px]"
    >
      <Link href={`/matches/${match.id}`}>
        <div className={cn(
          'group relative bg-bg-surface border border-border rounded-2xl p-5 h-full',
          'transition-all duration-200 hover:border-white/20 cursor-pointer overflow-hidden',
          isLive && 'border-red-500/40 bg-red-950/10'
        )}>
          {/* Live glow */}
          {isLive && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
          )}

          {/* Status + group */}
          <div className="flex items-center justify-between mb-4">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />
                {match.statusDisplay}
              </span>
            ) : isDone ? (
              <span className="text-[11px] font-mono text-white/30">FULL TIME</span>
            ) : (
              <span className="text-[11px] font-mono text-white/40">{match.statusDisplay}</span>
            )}
            {match.group && (
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                {match.group.replace('Group ', 'GRP ')}
              </span>
            )}
          </div>

          {/* Score area */}
          <div className="flex items-center justify-between gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <TeamFlag logoUrl={match.homeTeam.logoUrl} name={match.homeTeam.name} size="lg" />
              <span className={cn(
                'text-sm font-bold text-center leading-tight',
                homeWins ? 'text-white' : 'text-white/50'
              )}>
                {match.homeTeam.abbreviation}
              </span>
            </div>

            {/* Score or VS */}
            <div className="flex flex-col items-center shrink-0 gap-1">
              {hasScore ? (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-display text-4xl leading-none',
                    homeWins ? 'text-white' : isDone ? 'text-white/50' : 'text-white',
                    isLive && 'text-red-300'
                  )}>
                    {match.homeScore}
                  </span>
                  <span className="font-display text-2xl text-white/20">:</span>
                  <span className={cn(
                    'font-display text-4xl leading-none',
                    awayWins ? 'text-white' : isDone ? 'text-white/50' : 'text-white',
                    isLive && 'text-red-300'
                  )}>
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span className="font-display text-3xl text-white/20">VS</span>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <TeamFlag logoUrl={match.awayTeam.logoUrl} name={match.awayTeam.name} size="lg" />
              <span className={cn(
                'text-sm font-bold text-center leading-tight',
                awayWins ? 'text-white' : 'text-white/50'
              )}>
                {match.awayTeam.abbreviation}
              </span>
            </div>
          </div>

          {/* Venue */}
          {match.venueCity && (
            <div className="flex items-center justify-center gap-1 mt-4 text-[11px] text-white/25">
              <MapPin className="w-3 h-3" />
              {match.venueCity}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

interface TodayMatchesProps {
  matches: Match[]
}

export function TodayMatches({ matches }: TodayMatchesProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-white/20 text-sm border border-white/5 rounded-2xl">
        No matches today — check the full schedule
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-accent-gold rounded-full" />
          <h2 className="text-base font-bold text-white tracking-tight">Today's Matches</h2>
          <span className="text-xs font-mono text-white/30">{matches.length} fixtures</span>
        </div>
        <Link
          href="/schedule"
          className="flex items-center gap-1 text-xs text-white/40 hover:text-accent-blue transition-colors font-mono"
        >
          Full schedule <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {matches.map((match, i) => (
          <div key={match.id} style={{ scrollSnapAlign: 'start' }}>
            <MatchTile match={match} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
