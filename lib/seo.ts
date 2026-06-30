// Shared SEO utilities
// Set NEXT_PUBLIC_SITE_URL in Vercel env vars to your production domain

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')

export const SITE_NAME = 'World Cup 2026 Live Tracker'

export const DEFAULT_DESCRIPTION =
  'Follow FIFA World Cup 2026 in real-time. Live scores, match schedule, group standings, top scorers, and knockout bracket — updated every 30 seconds.'

export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'World Cup 2026 Live Tracker',
}
