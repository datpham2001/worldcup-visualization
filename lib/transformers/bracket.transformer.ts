import type { BracketData, BracketRound, BracketMatch, BracketRoundId } from '@/types/bracket'
import type { Match } from '@/types/match'

const ROUND_META: Record<BracketRoundId, { label: string; shortLabel: string; order: number }> = {
  r32:   { label: 'Round of 32',    shortLabel: 'R32',   order: 0 },
  r16:   { label: 'Round of 16',    shortLabel: 'R16',   order: 1 },
  qf:    { label: 'Quarter-finals', shortLabel: 'QF',    order: 2 },
  sf:    { label: 'Semi-finals',    shortLabel: 'SF',    order: 3 },
  '3rd': { label: 'Third Place',    shortLabel: '3rd',   order: 4 },
  final: { label: 'Final',          shortLabel: 'Final', order: 5 },
}

export function slugToRoundId(slug: string): BracketRoundId | null {
  const s = (slug || '').toLowerCase()
  if (s.includes('32'))      return 'r32'
  if (s.includes('16'))      return 'r16'
  if (s.includes('quarter')) return 'qf'
  if (s.includes('semi'))    return 'sf'
  if (s.includes('third') || s.includes('3rd') || s.includes('place')) return '3rd'
  if (s.includes('final'))   return 'final'
  return null
}

export function matchesToBracketData(matches: Match[]): BracketData {
  const byRound = new Map<BracketRoundId, Match[]>()

  for (const m of matches) {
    const roundId = slugToRoundId(m.round || '')
    if (!roundId) continue
    const arr = byRound.get(roundId) ?? []
    arr.push(m)
    byRound.set(roundId, arr)
  }

  const rounds: BracketRound[] = []

  for (const [roundId, roundMatches] of byRound) {
    const meta = ROUND_META[roundId]
    const sorted = [...roundMatches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const bracketMatches: BracketMatch[] = sorted.map((m, i) => {
      const isDone = m.status === 'post'
      const homeWins =
        isDone && m.homeScore !== null && m.awayScore !== null && m.homeScore > m.awayScore
      const awayWins =
        isDone && m.homeScore !== null && m.awayScore !== null && m.awayScore > m.homeScore

      return {
        id: m.id,
        roundId,
        position: i,
        home: {
          team: m.homeTeam,
          score: m.status !== 'pre' ? (m.homeScore ?? null) : null,
          winner: homeWins,
        },
        away: {
          team: m.awayTeam,
          score: m.status !== 'pre' ? (m.awayScore ?? null) : null,
          winner: awayWins,
        },
        status: m.status,
        date: m.date || null,
        isTbd: !m.homeTeam?.id || !m.awayTeam?.id,
      }
    })

    rounds.push({ id: roundId, label: meta.label, shortLabel: meta.shortLabel, matches: bracketMatches })
  }

  rounds.sort((a, b) => ROUND_META[a.id].order - ROUND_META[b.id].order)
  return { rounds }
}
