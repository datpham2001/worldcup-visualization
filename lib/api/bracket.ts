import type { BracketData } from '@/types/bracket'
import { fetchAllMatches } from './all-matches'
import { matchesToBracketData } from '@/lib/transformers/bracket.transformer'

export async function fetchBracket(): Promise<BracketData> {
  const all = await fetchAllMatches()
  const knockout = all.filter(m => {
    const slug = (m.round || '').toLowerCase()
    return !slug.includes('group')
  })
  return matchesToBracketData(knockout)
}
