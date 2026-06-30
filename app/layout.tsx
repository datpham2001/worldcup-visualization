import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/shared/Navbar'
import { TimezoneProvider } from '@/lib/hooks/useTimezone'
import { BASE_URL, SITE_NAME, DEFAULT_DESCRIPTION, OG_IMAGE } from '@/lib/seo'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'World Cup 2026 | Live Scores, Schedule & Standings',
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'World Cup 2026', 'FIFA World Cup 2026', 'WC2026', 'soccer live scores',
    'football 2026', 'match schedule', 'group standings', 'top scorers',
    'knockout bracket', 'live football scores',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: 'World Cup 2026 | Live Scores, Schedule & Standings',
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 | Live Scores, Schedule & Standings',
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        <TimezoneProvider>
          <Navbar />
          {children}
        </TimezoneProvider>
      </body>
    </html>
  )
}
