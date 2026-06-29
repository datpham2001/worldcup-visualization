import { NextResponse } from 'next/server'
import { fetchScorers } from '@/lib/api/scorers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await fetchScorers()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' },
  })
}
