import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/shared/Navbar'
import { TimezoneProvider } from '@/lib/hooks/useTimezone'
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
  title: 'World Cup 2026 | Live Tracker',
  description: 'Real-time FIFA World Cup 2026 match scores, standings, bracket, and top scorers',
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
