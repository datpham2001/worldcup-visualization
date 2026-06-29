'use client'

import { cn, getGoalDiff } from '@/lib/utils'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Group, StandingRow } from '@/types/standings'
import { motion } from 'framer-motion'

// WC 2026: top 8 of 12 third-place teams advance to R32
const ADVANCE_SPOTS = 8

interface BestThirdTableProps {
  groups: Group[]
}

export function BestThirdTable({ groups }: BestThirdTableProps) {
  // Extract the 3rd-place team from each group (rank 3 after sort)
  const thirds: (StandingRow & { groupName: string })[] = groups
    .map(g => {
      const third = g.entries[2]
      return third ? { ...third, groupName: g.abbreviation || g.name } : null
    })
    .filter((r): r is StandingRow & { groupName: string } => r !== null)

  const sorted = [...thirds]
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
    )
    .map((r, i) => ({ ...r, displayRank: i + 1 }))

  if (sorted.length === 0) return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary tracking-wide">Best Third-Place Teams</h2>
          <p className="text-xs text-text-muted mt-0.5">Top 8 advance to Round of 32</p>
        </div>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-accent-gold/30 text-accent-gold bg-accent-gold/8">
          {Math.min(sorted.length, ADVANCE_SPOTS)} / {sorted.length} advancing
        </span>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[20px_1fr_40px_repeat(7,_28px)] gap-x-1 px-3 py-2 text-xs text-text-muted font-mono border-b border-border bg-bg-elevated">
          <span className="text-center">#</span>
          <span>Team</span>
          <span className="text-center text-[10px]">Group</span>
          <span className="text-center">GP</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GD</span>
          <span className="text-center">GF</span>
          <span className="text-center font-semibold text-text-secondary">Pts</span>
        </div>

        {sorted.map((entry, i) => {
          const advances = entry.displayRank <= ADVANCE_SPOTS
          return (
            <motion.div
              key={entry.team.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={cn(
                'flex items-stretch border-b border-border-subtle last:border-0 transition-colors',
                advances ? 'hover:bg-bg-elevated' : 'hover:bg-bg-elevated opacity-60',
              )}
            >
              {/* Qualification stripe */}
              <div className={cn(
                'w-0.5 self-stretch shrink-0',
                advances ? 'bg-accent-gold' : 'bg-text-muted/20',
              )} />

              <div className="flex-1 grid grid-cols-[20px_1fr_40px_repeat(7,_28px)] gap-x-1 px-3 py-2.5 items-center">
                {/* Rank */}
                <span className={cn(
                  'text-center text-xs font-bold font-mono',
                  advances ? 'text-accent-gold' : 'text-text-muted',
                )}>
                  {entry.displayRank}
                </span>

                {/* Team */}
                <div className="flex items-center gap-2 min-w-0">
                  <TeamFlag logoUrl={entry.team.logoUrl} name={entry.team.name} size="sm" />
                  <span className="text-sm font-medium text-text-primary truncate">
                    {entry.team.shortName}
                  </span>
                  {advances && entry.displayRank <= ADVANCE_SPOTS && (
                    <span className="hidden sm:inline text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(232,184,75,0.15)', color: '#e8b84b', border: '1px solid rgba(232,184,75,0.3)' }}>
                      ADV
                    </span>
                  )}
                </div>

                {/* Source group */}
                <span className="text-center text-[10px] font-mono text-text-muted">
                  {entry.groupName.replace('Group ', '')}
                </span>

                <span className="text-center text-xs font-mono text-text-secondary">{entry.gamesPlayed}</span>
                <span className="text-center text-xs font-mono text-text-secondary">{entry.wins}</span>
                <span className="text-center text-xs font-mono text-text-secondary">{entry.draws}</span>
                <span className="text-center text-xs font-mono text-text-secondary">{entry.losses}</span>
                <span className={cn(
                  'text-center text-xs font-mono',
                  entry.goalDifference > 0 ? 'text-accent-green' : entry.goalDifference < 0 ? 'text-accent-red' : 'text-text-secondary',
                )}>{getGoalDiff(entry.goalDifference)}</span>
                <span className="text-center text-xs font-mono text-text-secondary">{entry.goalsFor}</span>
                <span className="text-center text-xs font-bold font-mono text-text-primary">{entry.points}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-gold" />
          Advances to R32
        </span>
      </div>
    </div>
  )
}
