'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, Trophy, Globe, ChevronDown, Search } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useTimezone } from '@/lib/hooks/useTimezone'
import { TIMEZONES, type TimezoneOption } from '@/lib/timezone'
import { AnimatePresence, motion } from 'framer-motion'

const links = [
  { href: '/schedule',  label: 'Schedule'    },
  { href: '/standings', label: 'Standings'   },
  { href: '/scorers',   label: 'Top Scorers' },
  { href: '/bracket',   label: 'Bracket'     },
]

// ─── Timezone picker ──────────────────────────────────────────────────────────
function TimezonePicker({ isHome }: { isHome: boolean }) {
  const { timezone, setTimezone } = useTimezone()
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const containerRef      = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return TIMEZONES
    return TIMEZONES.filter(t =>
      t.label.toLowerCase().includes(q) ||
      t.abbr.toLowerCase().includes(q) ||
      t.offset.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const pick = (tz: TimezoneOption) => {
    setTimezone(tz)
    setOpen(false)
    setQuery('')
  }

  const btnBase = cn(
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-mono font-semibold transition-all duration-200 border',
    open
      ? 'bg-bg-elevated border-accent-blue/40 text-text-primary'
      : isHome
      ? 'bg-white/8 border-white/15 text-white/75 hover:bg-white/14 hover:text-white'
      : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-white/20',
  )

  return (
    <div ref={containerRef} className="relative">
      <button onClick={() => setOpen(v => !v)} className={btnBase}>
        <Globe className="w-3.5 h-3.5 opacity-70" />
        <span>{timezone.abbr}</span>
        <ChevronDown className={cn('w-3 h-3 opacity-50 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+8px)] right-0 z-[100] w-[280px] rounded-xl border border-border overflow-hidden shadow-2xl"
            style={{ background: '#0d1929' }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
              <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search timezone…"
                className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[300px] py-1 scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-text-muted text-[12px]">No results</div>
              ) : filtered.map(tz => (
                <button
                  key={tz.tz}
                  onClick={() => pick(tz)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-100',
                    tz.tz === timezone.tz ? 'bg-accent-blue/15' : 'hover:bg-white/5',
                  )}
                >
                  <span className={cn(
                    'text-[11px] font-mono font-bold w-10 shrink-0',
                    tz.tz === timezone.tz ? 'text-accent-blue' : 'text-text-muted',
                  )}>
                    {tz.abbr}
                  </span>
                  <span className={cn(
                    'flex-1 text-[12px] truncate',
                    tz.tz === timezone.tz ? 'text-accent-blue' : 'text-text-primary',
                  )}>
                    {tz.label}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted shrink-0">{tz.offset}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
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
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Trophy className="w-5 h-5 text-accent-gold" />
          <span className={cn('font-display text-xl tracking-wide', isHome ? 'text-white' : 'text-text-primary')}>
            WC 2026
          </span>
        </Link>

        {/* Desktop nav — hidden on home */}
        {!isHome && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
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

        {/* Right side: timezone picker + mobile menu */}
        <div className="flex items-center gap-2 ml-auto">
          <TimezonePicker isHome={isHome} />

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
