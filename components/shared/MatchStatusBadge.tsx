import { cn } from '@/lib/utils'
import type { MatchStatus } from '@/types/match'

interface MatchStatusBadgeProps {
  status: MatchStatus
  statusDisplay: string
  clock?: string | null
  className?: string
}

export function MatchStatusBadge({ status, statusDisplay, className }: MatchStatusBadgeProps) {
  return (
    <span
      className={cn(
        'text-xs font-mono font-semibold px-2 py-0.5 rounded-full tracking-wide',
        status === 'in' && 'bg-red-500/20 text-red-400',
        status === 'post' && 'bg-bg-elevated text-text-secondary',
        status === 'pre' && 'bg-bg-elevated text-text-secondary',
        className
      )}
    >
      {status === 'in' && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-live-pulse" />
      )}
      {statusDisplay}
    </span>
  )
}
