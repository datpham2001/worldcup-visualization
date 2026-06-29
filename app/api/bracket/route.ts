import { NextResponse } from 'next/server'
import { fetchBracket } from '@/lib/api/bracket'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await fetchBracket()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
