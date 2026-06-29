import { StatBar } from './StatBar'
import type { MatchStat } from '@/types/match'

const PRIORITY_STATS = ['possession', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'offsides', 'yellowCards', 'saves']

interface MatchStatsProps {
  stats: MatchStat[]
}

export function MatchStats({ stats }: MatchStatsProps) {
  if (stats.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">Stats not available</p>
  }

  const sorted = [...stats].sort((a, b) => {
    const ai = PRIORITY_STATS.indexOf(a.name)
    const bi = PRIORITY_STATS.indexOf(b.name)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="py-2">
      {sorted.slice(0, 12).map(stat => (
        <StatBar
          key={stat.name}
          name={stat.name}
          homeValue={stat.homeValue}
          awayValue={stat.awayValue}
          homeDisplay={stat.homeDisplay}
          awayDisplay={stat.awayDisplay}
        />
      ))}
    </div>
  )
}
