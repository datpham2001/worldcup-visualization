'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Group } from '@/types/standings'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function MiniGroupTable({ group, index }: { group: Group; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-bg-surface border border-border rounded-2xl overflow-hidden"
    >
      {/* Group header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="text-xs font-display text-accent-gold tracking-widest">{group.name.toUpperCase()}</span>
        <span className="text-[10px] font-mono text-white/25">PTS</span>
      </div>

      {/* Team rows */}
      {group.entries.slice(0, 4).map((entry, rowIdx) => {
        const advances = rowIdx < 2
        const hasPlayed = entry.gamesPlayed > 0

        return (
          <div
            key={entry.team.id}
            className={cn(
              'flex items-center gap-2.5 px-4 py-2 border-b border-white/[0.04] last:border-0',
              advances && hasPlayed && 'bg-emerald-950/20',
            )}
          >
            {/* Qualification dot */}
            <div className={cn(
              'w-0.5 h-4 rounded-full shrink-0',
              advances && hasPlayed ? 'bg-accent-green/60' : 'bg-transparent'
            )} />

            <span className="text-[11px] font-mono text-white/25 w-3 shrink-0">{entry.rank}</span>
            <TeamFlag logoUrl={entry.team.logoUrl} name={entry.team.name} size="sm" />
            <span className="flex-1 text-xs text-white/80 truncate font-medium">{entry.team.shortName}</span>

            {/* Mini form */}
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono text-white/30">{entry.gamesPlayed}GP</span>
            </div>

            <span className="text-xs font-mono font-bold text-white/90 w-5 text-right">{entry.points}</span>
          </div>
        )
      })}
    </motion.div>
  )
}

interface MiniStandingsProps {
  groups: Group[]
}

export function MiniStandings({ groups }: MiniStandingsProps) {
  const preview = groups.slice(0, 6)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-accent-green rounded-full" />
          <h2 className="text-base font-bold text-white tracking-tight">Group Standings</h2>
          <span className="text-xs font-mono text-white/30">{groups.length} groups</span>
        </div>
        <Link
          href="/standings"
          className="flex items-center gap-1 text-xs text-white/40 hover:text-accent-blue transition-colors font-mono"
        >
          All groups <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {preview.map((group, i) => (
          <MiniGroupTable key={group.id} group={group} index={i} />
        ))}
      </div>

      <p className="text-[11px] text-white/20 font-mono mt-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-green/60 inline-block" />
        Green row = qualified for Round of 32
      </p>
    </div>
  )
}
