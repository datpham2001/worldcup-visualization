'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MatchTimeline } from './MatchTimeline'
import { MatchStats } from './MatchStats'
import { MatchLineup } from './MatchLineup'
import type { MatchDetail } from '@/types/match'
import { cn } from '@/lib/utils'

type Tab = 'events' | 'stats' | 'lineup'

interface Props {
  match: MatchDetail
}

export function MatchDetailTabs({ match }: Props) {
  const hasEvents = match.events.length > 0
  const hasStats  = match.stats.length > 0
  const hasLineup = match.homeLineup.length > 0 || match.awayLineup.length > 0

  const [tab, setTab] = useState<Tab>('events')

  const tabs: { id: Tab; label: string; count?: number; disabled?: boolean }[] = [
    { id: 'events', label: 'Match Events', count: hasEvents ? match.events.length : undefined, disabled: !hasEvents },
    { id: 'stats',  label: 'Statistics',   count: hasStats  ? match.stats.length  : undefined, disabled: !hasStats  },
    { id: 'lineup', label: 'Lineups',      disabled: !hasLineup },
  ]

  if (!hasEvents && !hasStats && !hasLineup) {
    return (
      <div className="bg-bg-surface border border-border rounded-xl p-10 text-center text-text-muted text-sm">
        Match details will be available when the match begins.
      </div>
    )
  }

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setTab(t.id)}
            disabled={t.disabled}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-3.5 text-[13px] font-semibold transition-all duration-150',
              tab === t.id
                ? 'text-text-primary border-b-2 border-accent-blue -mb-px'
                : 'text-text-muted hover:text-text-secondary',
              t.disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                tab === t.id
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'bg-bg-elevated text-text-muted',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="p-5"
        >
          {tab === 'events' && (
            hasEvents ? (
              <MatchTimeline
                events={match.events}
                homeTeamName={match.homeTeam.abbreviation}
                awayTeamName={match.awayTeam.abbreviation}
              />
            ) : (
              <p className="text-center text-text-muted text-sm py-10">No events recorded</p>
            )
          )}
          {tab === 'stats' && (
            hasStats ? (
              <MatchStats stats={match.stats} />
            ) : (
              <p className="text-center text-text-muted text-sm py-10">No statistics available</p>
            )
          )}
          {tab === 'lineup' && (
            hasLineup ? (
              <MatchLineup
                homeLineup={match.homeLineup}
                awayLineup={match.awayLineup}
                homeFormation={match.homeFormation}
                awayFormation={match.awayFormation}
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
              />
            ) : (
              <p className="text-center text-text-muted text-sm py-10">Lineups not yet available</p>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
