import { NextResponse } from 'next/server'

// Module-level photo cache (persists across requests in same server instance)
const cache = new Map<string, { url: string | null; ts: number }>()
const TTL       = 3_600_000  // 1 hour
const MAX_CACHE = 500        // prevent unbounded growth

interface SportsDBPlayer {
  strCutout?: string
  strThumb?: string
  strFanart1?: string
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const id   = searchParams.get('id') || name

  if (!name || !id || name.length > 100) {
    return NextResponse.json({ url: null })
  }

  const cached = cache.get(id)
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ url: cached.url }, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  }

  try {
    const encoded = encodeURIComponent(name)
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encoded}`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (res.ok) {
      const data = await res.json() as { player?: SportsDBPlayer[] }
      const player = data?.player?.[0]
      const url = player?.strCutout || player?.strThumb || null
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!)
      cache.set(id, { url, ts: Date.now() })
      return NextResponse.json({ url }, {
        headers: { 'Cache-Control': 'public, max-age=3600' },
      })
    }
  } catch { /* timeout or network error */ }

  cache.set(id, { url: null, ts: Date.now() })
  return NextResponse.json({ url: null }, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
