import { NextRequest, NextResponse } from 'next/server'
import { fetchMatchSummary } from '@/lib/api/match-summary'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ESPN event IDs are numeric — reject anything else to prevent query-string injection
  if (!/^\d{1,10}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 })
  }
  const match = await fetchMatchSummary(id)
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }
  return NextResponse.json(match, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  })
}
