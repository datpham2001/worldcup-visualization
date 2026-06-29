import { ESPN_BASE, ESPN_CORE } from '@/lib/constants'

export class EspnApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'EspnApiError'
  }
}

interface FetchOptions {
  cacheSeconds?: number
  noStore?: boolean
}

async function espnFetch<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const fetchOpts: RequestInit = {}

  if (opts.noStore) {
    fetchOpts.cache = 'no-store'
  } else if (opts.cacheSeconds !== undefined) {
    fetchOpts.next = { revalidate: opts.cacheSeconds }
  }

  let res = await fetch(url, fetchOpts)

  if (!res.ok) {
    await new Promise(r => setTimeout(r, 1000))
    res = await fetch(url, fetchOpts)
  }

  if (!res.ok) {
    throw new EspnApiError(res.status, `ESPN API error ${res.status}: ${url}`)
  }

  return res.json() as Promise<T>
}

export function espnSiteUrl(path: string): string {
  return `${ESPN_BASE}${path}`
}

export function espnCoreUrl(path: string): string {
  return `${ESPN_CORE}${path}`
}

export { espnFetch }
