import { NextResponse } from 'next/server'
import { fetchStandings } from '@/lib/api/standings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const groups = await fetchStandings()
  return NextResponse.json(groups, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
