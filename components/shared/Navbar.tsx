'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, Trophy } from 'lucide-react'
import { useState } from 'react'

const links = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/standings', label: 'Standings' },
  { href: '/scorers', label: 'Top Scorers' },
  { href: '/bracket', label: 'Bracket' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        isHome
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-border backdrop-blur-xl bg-bg-base/80'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Trophy className={cn('w-5 h-5', isHome ? 'text-accent-gold' : 'text-accent-gold')} />
          <span className={cn('font-display text-xl tracking-wide', isHome ? 'text-white' : 'text-text-primary')}>
            WC 2026
          </span>
        </Link>

        {/* Desktop nav — hidden on home */}
        {!isHome && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  pathname === link.href
                    ? 'text-text-primary bg-bg-elevated'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile hamburger — hidden on home */}
        {!isHome && (
          <button
            className="md:hidden text-text-secondary hover:text-text-primary"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {!isHome && open && (
        <div className="md:hidden border-t border-border bg-bg-surface/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  pathname === link.href
                    ? 'text-text-primary bg-bg-elevated font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
