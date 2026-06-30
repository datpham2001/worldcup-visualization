import type { Metadata } from 'next'
import { OG_IMAGE } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Top Scorers & Leaders',
  description: 'FIFA World Cup 2026 top goal scorers, assist leaders, and team goal tallies. Updated continuously throughout the tournament.',
  openGraph: {
    title: 'FIFA World Cup 2026 Top Scorers & Assists',
    description: 'World Cup 2026 top goal scorers, assist leaders, and team goal tallies — updated live.',
    images: [OG_IMAGE],
  },
  alternates: { canonical: '/scorers' },
}

export default function ScorersLayout({ children }: { children: React.ReactNode }) {
  return children
}
