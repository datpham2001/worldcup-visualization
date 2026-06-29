import { NextResponse } from 'next/server'
import { fetchAllMatches } from '@/lib/api/all-matches'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const matches = await fetchAllMatches()
    return NextResponse.json(matches, {
      headers: { 'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=45' },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
