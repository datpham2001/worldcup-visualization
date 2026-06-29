import { fetchScoreboard } from '@/lib/api/scoreboard'
import { HeroPage } from '@/components/home/HeroPage'
import { toEspnDateParam } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const today = new Date()
  const todayParam = toEspnDateParam(today.toISOString().split('T')[0])
  const todayMatches = await fetchScoreboard(todayParam)

  const liveCount = todayMatches.filter(m => m.status === 'in').length
  const totalGoals = todayMatches.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)

  return (
    <HeroPage
      todayCount={todayMatches.length}
      liveCount={liveCount}
      totalGoals={totalGoals}
    />
  )
}
