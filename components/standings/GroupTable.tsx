import Link from 'next/link'
import { cn, getGoalDiff } from '@/lib/utils'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Group, StandingRow } from '@/types/standings'

function NoteIndicator({ note }: { note: StandingRow['note'] }) {
  if (!note) return <div className="w-0.5 self-stretch" />
  return (
    <div className={cn(
      'w-0.5 self-stretch rounded-full',
      note === 'advanced' && 'bg-accent-green',
      note === 'playoff' && 'bg-accent-yellow',
      note === 'eliminated' && 'bg-text-muted/30',
    )} />
  )
}

interface GroupTableProps {
  group: Group
}

export function GroupTable({ group }: GroupTableProps) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="px-4 py-2.5 bg-bg-elevated border-b border-border">
        <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">
          {group.name}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_repeat(7,_28px)] gap-x-1 px-3 py-1.5 text-xs text-text-muted font-mono border-b border-border-subtle">
        <span>Team</span>
        <span className="text-center">GP</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-center">GF</span>
        <span className="text-center font-semibold text-text-secondary">Pts</span>
      </div>

      {/* Rows */}
      {group.entries.map((entry) => (
        <div
          key={entry.team.id}
          className="flex items-stretch border-b border-border-subtle last:border-0 hover:bg-bg-elevated transition-colors"
        >
          <NoteIndicator note={entry.note} />
          <div className="flex-1 grid grid-cols-[1fr_repeat(7,_28px)] gap-x-1 px-3 py-2.5 items-center">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-text-muted w-3 shrink-0">{entry.rank}</span>
              <TeamFlag logoUrl={entry.team.logoUrl} name={entry.team.name} size="sm" />
              <span className="text-sm font-medium text-text-primary truncate">
                {entry.team.shortName}
              </span>
            </div>
            <span className="text-center text-xs font-mono text-text-secondary">{entry.gamesPlayed}</span>
            <span className="text-center text-xs font-mono text-text-secondary">{entry.wins}</span>
            <span className="text-center text-xs font-mono text-text-secondary">{entry.draws}</span>
            <span className="text-center text-xs font-mono text-text-secondary">{entry.losses}</span>
            <span className={cn(
              'text-center text-xs font-mono',
              entry.goalDifference > 0 ? 'text-accent-green' : entry.goalDifference < 0 ? 'text-accent-red' : 'text-text-secondary'
            )}>{getGoalDiff(entry.goalDifference)}</span>
            <span className="text-center text-xs font-mono text-text-secondary">{entry.goalsFor}</span>
            <span className="text-center text-xs font-bold font-mono text-text-primary">{entry.points}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
