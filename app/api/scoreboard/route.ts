import { NextRequest, NextResponse } from 'next/server'
import { fetchScoreboard } from '@/lib/api/scoreboard'
import { toEspnDateParam } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date')
  // Accept YYYY-MM-DD or YYYYMMDD only — reject anything else
  const safeDate = dateParam && /^\d{4}-?\d{2}-?\d{2}$/.test(dateParam) ? dateParam : null
  const espnDate = safeDate ? toEspnDateParam(safeDate) : undefined
  const matches = await fetchScoreboard(espnDate)
  return NextResponse.json(matches, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  })
}
