'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Match } from '@/types/match'

// ─── Countdown to final ───────────────────────────────────────────────────
const FINAL_DATE = new Date('2026-07-19T20:00:00Z')

function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const ms = FINAL_DATE.getTime() - Date.now()
      if (ms <= 0) return
      setT({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'DAYS', v: t.d },
    { label: 'HRS',  v: t.h },
    { label: 'MIN',  v: t.m },
    { label: 'SEC',  v: t.s },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map(({ label, v }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center">
            <div className="relative min-w-[52px] sm:min-w-[64px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center backdrop-blur-sm">
              <span className="font-display text-3xl sm:text-4xl text-white leading-none tabular-nums">
                {String(v).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/40 mt-1.5 tracking-widest">{label}</span>
          </div>
          {i < 3 && <span className="font-display text-2xl text-white/20 mb-4">:</span>}
        </div>
      ))}
    </div>
  )
}

// ─── Live ticker ──────────────────────────────────────────────────────────
function TickerItem({ match }: { match: Match }) {
  const isLive = match.status === 'in'
  const isDone = match.status === 'post'
  const hasScore = isLive || isDone

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer shrink-0 border-r border-white/10">
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />
            {match.statusDisplay}
          </span>
        )}
        {!isLive && (
          <span className="text-[10px] font-mono text-white/40 shrink-0">{match.statusDisplay}</span>
        )}
        <span className="text-sm font-semibold text-white/90">{match.homeTeam.abbreviation}</span>
        {hasScore ? (
          <span className="font-display text-base text-white leading-none">
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <span className="text-xs text-white/30 font-mono">vs</span>
        )}
        <span className="text-sm font-semibold text-white/90">{match.awayTeam.abbreviation}</span>
      </div>
    </Link>
  )
}

function LiveTicker({ matches }: { matches: Match[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Auto-scroll the ticker
  useEffect(() => {
    const el = trackRef.current
    if (!el || matches.length === 0) return
    let pos = 0
    const id = setInterval(() => {
      pos += 0.5
      if (pos >= el.scrollWidth / 2) pos = 0
      el.style.transform = `translateX(-${pos}px)`
    }, 16)
    return () => clearInterval(id)
  }, [matches.length])

  if (matches.length === 0) return null

  const doubled = [...matches, ...matches]

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-white/[0.03]">
      <div className="flex items-center">
        <div className="shrink-0 px-3 py-2 border-r border-white/10 bg-accent-gold/10">
          <span className="text-[10px] font-mono font-bold text-accent-gold tracking-widest uppercase">Today</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={trackRef} className="flex" style={{ willChange: 'transform' }}>
            {doubled.map((m, i) => (
              <TickerItem key={`${m.id}-${i}`} match={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────
function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 border-x border-white/10 first:border-l-0 last:border-r-0">
      <span className="font-display text-xl sm:text-2xl text-white leading-none">{value}</span>
      <span className="text-[10px] font-mono text-white/40 mt-1 tracking-widest uppercase">{label}</span>
    </div>
  )
}

// ─── Main hero ────────────────────────────────────────────────────────────
interface HeroSectionProps {
  matches: Match[]
  totalGoals: number
  liveCount: number
}

export function HeroSection({ matches, totalGoals, liveCount }: HeroSectionProps) {
  const todayCount = matches.length
  const wordVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }),
  }

  return (
    <div className="relative overflow-hidden pt-14" style={{ minHeight: '88vh' }}>
      {/* Scan-line texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 6px)',
        }}
      />

      {/* Radial glow - center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Gold accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent" />

      {/* Live ticker */}
      <LiveTicker matches={matches} />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-12" style={{ minHeight: '80vh' }}>

        {/* Tournament badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-[11px] font-mono font-semibold px-4 py-1.5 rounded-full mb-10 tracking-widest uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-live-pulse" />
          FIFA World Cup 2026 · In Progress
        </motion.div>

        {/* Title stack */}
        <div className="mb-10">
          <motion.div
            custom={0}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            className="font-display text-[13vw] sm:text-[10vw] md:text-[8vw] lg:text-[96px] leading-none text-white tracking-wider"
          >
            WORLD CUP
          </motion.div>

          {/* Outlined "2026" — the signature treatment */}
          <motion.div
            custom={1}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            className="font-display leading-none tracking-widest"
            style={{
              fontSize: 'clamp(80px, 20vw, 200px)',
              WebkitTextStroke: '2px #e8b84b',
              color: 'transparent',
              textShadow: '0 0 80px rgba(232,184,75,0.15)',
            }}
          >
            2026
          </motion.div>
        </div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
            Final · MetLife Stadium · July 19
          </p>
          <Countdown />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] divide-x divide-white/10"
        >
          <StatChip value="48" label="Nations" />
          <StatChip value="104" label="Matches" />
          <StatChip value={totalGoals || '—'} label="Goals" />
          {liveCount > 0 && <StatChip value={`${liveCount} LIVE`} label="Now" />}
          {todayCount > 0 && <StatChip value={todayCount} label="Today" />}
        </motion.div>

        {/* Host cities */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-white/25 font-mono mt-6 tracking-wider"
        >
          USA · Canada · Mexico · 16 host cities
        </motion.p>
      </div>
    </div>
  )
}
