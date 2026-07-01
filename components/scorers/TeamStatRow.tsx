'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { TeamFlag } from '@/components/shared/TeamFlag'
import { cn } from '@/lib/utils'
import type { TeamStat } from '@/types/scorers'

interface Props {
  stat: TeamStat
  index?: number
  onClick?: () => void
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.28, ease: 'easeOut' },
  }),
}

export function TeamStatRow({ stat, index = 0, onClick }: Props) {
  const isTop3 = stat.rank <= 3

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'group relative flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0',
        'transition-colors duration-150',
        isTop3
          ? 'bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.06]'
          : 'hover:bg-white/[0.025]',
        onClick && 'cursor-pointer',
      )}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
    >
      {/* Top-3 accent bar */}
      {isTop3 && (
        <motion.div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-[2px] rounded-r',
            stat.rank === 1 ? 'bg-amber-400/70' :
            stat.rank === 2 ? 'bg-slate-300/50' : 'bg-amber-700/50',
          )}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.04 + 0.1, duration: 0.3 }}
        />
      )}

      {/* Rank */}
      <div className="w-7 shrink-0 flex justify-center">
        {isTop3 ? (
          <motion.span
            className={cn(
              'text-xs font-black',
              stat.rank === 1 ? 'text-amber-400' :
              stat.rank === 2 ? 'text-slate-300' : 'text-amber-600',
            )}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
          >
            {stat.rank}
          </motion.span>
        ) : (
          <span className="text-xs font-mono text-text-muted">{stat.rank}</span>
        )}
      </div>

      {/* Flag */}
      <div className="shrink-0">
        <TeamFlag logoUrl={stat.team.logoUrl} name={stat.team.name} size="md" />
      </div>

      {/* Team name + record */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors">
          {stat.team.name}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">
          {stat.matchesPlayed}GP · {stat.wins}W {stat.draws}D {stat.losses}L
        </p>
      </div>

      {/* Mini stats */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] font-mono text-text-muted bg-bg-elevated border border-border/50 px-1.5 py-0.5 rounded-md">
          GA {stat.goalsAgainst}
        </span>
        <span className={cn(
          'text-[11px] font-mono px-1.5 py-0.5 rounded-md border',
          stat.goalDifference > 0
            ? 'text-green-400 border-green-400/20 bg-green-400/8'
            : stat.goalDifference < 0
            ? 'text-red-400 border-red-400/20 bg-red-400/8'
            : 'text-text-muted border-border/50 bg-bg-elevated',
        )}>
          {stat.goalDifference > 0 ? '+' : ''}{stat.goalDifference}
        </span>
      </div>

      {/* Chevron */}
      {onClick && (
        <ChevronRight className="w-4 h-4 text-text-muted/40 shrink-0 group-hover:text-text-muted transition-colors" />
      )}

      {/* Goals scored */}
      <div className="shrink-0 text-right min-w-[3.5rem]">
        <motion.span
          className="font-display text-2xl font-bold text-text-primary block leading-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.04 + 0.08, type: 'spring', stiffness: 280 }}
        >
          {stat.goalsFor}
        </motion.span>
        <p className="text-[11px] text-text-muted mt-0.5">goals</p>
      </div>
    </motion.div>
  )
}
