'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { TeamFlag } from '@/components/shared/TeamFlag'
import { cn } from '@/lib/utils'
import type { Scorer } from '@/types/scorers'

interface PlayerRowProps {
  scorer: Scorer
  highlightStat: 'goals' | 'assists'
  enhancedPhotoUrl?: string | null
  index?: number
}

const MEDAL = [
  { color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/30' },
  { color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/25' },
  { color: 'text-amber-600', bg: 'bg-amber-700/15', border: 'border-amber-600/30' },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const m = MEDAL[rank - 1]
    return (
      <motion.div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center border text-xs font-black',
          m.color, m.bg, m.border,
        )}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
      >
        {rank}
      </motion.div>
    )
  }
  return (
    <span className="w-7 h-7 flex items-center justify-center text-xs font-mono text-text-muted">
      {rank}
    </span>
  )
}

function PlayerAvatar({ photoUrl, displayName, shortName }: {
  photoUrl: string | null
  displayName: string
  shortName: string
}) {
  const initials = (shortName || displayName)
    .split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="relative w-11 h-11 shrink-0">
      {/* Glow ring on avatar */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
      <div className="w-11 h-11 rounded-full overflow-hidden bg-bg-elevated border border-white/10 shrink-0 relative">
        {/* Initials layer (always rendered, shows through if image fails) */}
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-text-muted bg-gradient-to-br from-[#1a2540] to-[#111827]">
          {initials}
        </div>
        {photoUrl && (
          <Image
            src={photoUrl}
            alt={displayName}
            fill
            className="object-cover object-top"
            unoptimized
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img.style.display = 'none'
            }}
          />
        )}
      </div>
    </div>
  )
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.045, duration: 0.28, ease: 'easeOut' },
  }),
}

export function PlayerRow({ scorer, highlightStat, enhancedPhotoUrl, index = 0 }: PlayerRowProps) {
  const isTop3    = scorer.rank <= 3
  const statValue = highlightStat === 'goals' ? scorer.goals : scorer.assists
  const photoUrl  = enhancedPhotoUrl !== undefined ? enhancedPhotoUrl : scorer.athlete.photoUrl

  const hasSecondary = highlightStat === 'goals'
    ? scorer.assists > 0
    : scorer.goals > 0
  const secondaryLabel = highlightStat === 'goals'
    ? `${scorer.assists} ast`
    : `${scorer.goals} gls`

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'group relative flex items-center gap-3 py-3 px-4 border-b border-border-subtle last:border-0',
        'transition-colors duration-150',
        isTop3
          ? 'bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.06]'
          : 'hover:bg-white/[0.025]',
      )}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Top-3 left accent */}
      {isTop3 && (
        <motion.div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-[2px] rounded-r',
            scorer.rank === 1 ? 'bg-amber-400/70' :
            scorer.rank === 2 ? 'bg-slate-300/50' : 'bg-amber-700/50',
          )}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.045 + 0.1, duration: 0.3 }}
        />
      )}

      {/* Rank */}
      <div className="w-7 shrink-0 flex justify-center">
        <RankBadge rank={scorer.rank} />
      </div>

      {/* Avatar */}
      <PlayerAvatar
        photoUrl={photoUrl ?? null}
        displayName={scorer.athlete.displayName}
        shortName={scorer.athlete.shortName}
      />

      {/* Name + team */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate leading-tight group-hover:text-white transition-colors">
          {scorer.athlete.displayName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TeamFlag logoUrl={scorer.team.logoUrl} name={scorer.team.name} size="sm" />
          <span className="text-[11px] text-text-muted">{scorer.team.abbreviation}</span>
          {scorer.athlete.position && (
            <span className="text-[10px] font-mono text-text-muted/50 border border-border/30 rounded px-1 leading-4">
              {scorer.athlete.position}
            </span>
          )}
        </div>
      </div>

      {/* Secondary badge */}
      {hasSecondary && (
        <div className="hidden sm:flex shrink-0">
          <span className="text-[11px] font-mono text-text-muted bg-bg-elevated border border-border/50 px-1.5 py-0.5 rounded-md">
            {secondaryLabel}
          </span>
        </div>
      )}

      {/* Primary stat */}
      <div className="shrink-0 text-right min-w-[3.5rem]">
        <motion.span
          className="font-display text-2xl font-bold text-text-primary block leading-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.045 + 0.08, type: 'spring', stiffness: 280 }}
        >
          {statValue}
        </motion.span>
        <p className="text-[11px] text-text-muted mt-0.5 capitalize">
          {highlightStat === 'goals' ? 'goals' : 'assists'}
        </p>
      </div>
    </motion.div>
  )
}
