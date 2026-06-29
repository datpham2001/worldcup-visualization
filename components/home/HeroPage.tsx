'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, BarChart2, Star, GitBranch, ArrowUpRight, Target, Zap, Trophy } from 'lucide-react'

const E = [0.22, 1, 0.36, 1] as const

// ─── Host nations ──────────────────────────────────────────────────────────────
const HOSTS = [
  { flag: '🇺🇸', code: 'USA', detail: '11 cities', accent: '#4a90e2', glow: 'rgba(74,144,226,0.22)' },
  { flag: '🇨🇦', code: 'CAN', detail: '2 cities',  accent: '#e84040', glow: 'rgba(232,64,64,0.22)'  },
  { flag: '🇲🇽', code: 'MEX', detail: '3 cities',  accent: '#2ec27e', glow: 'rgba(46,194,126,0.22)' },
]

function HostNations() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.32, duration: 0.5 }}
        className="text-[10px] font-mono tracking-[0.25em] uppercase"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Host Nations
      </motion.p>
      <div className="flex gap-2.5">
        {HOSTS.map(({ flag, code, detail, accent, glow }, i) => (
          <motion.div
            key={code}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 + i * 0.08, duration: 0.5, ease: E }}
            className="relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl overflow-hidden select-none"
            style={{
              background: 'rgba(4,7,16,0.68)',
              border: `1px solid ${accent}50`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${accent}15 inset`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 15% 50%, ${glow} 0%, transparent 70%)` }} />
            <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />
            <span className="relative text-2xl leading-none">{flag}</span>
            <div className="relative">
              <p className="text-sm font-bold leading-none tracking-wide" style={{ color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>{code}</p>
              <p className="text-[10px] font-mono mt-0.5 leading-none" style={{ color: accent, opacity: 0.75 }}>{detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.62, duration: 0.5 }}
        className="text-[10px] font-mono tracking-wider"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        USA · Canada · Mexico · 16 host cities
      </motion.p>
    </div>
  )
}

// ─── Stat pills ────────────────────────────────────────────────────────────────
interface StatItem { value: string; label: string; accent: string; icon: React.ReactNode; delay: number }

function StatPill({ value, label, accent, icon, delay }: StatItem) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: E }}
      className="relative flex flex-col items-center gap-1.5 px-4 sm:px-5 py-3 rounded-2xl overflow-hidden min-w-[76px]"
      style={{
        background: 'rgba(4,7,16,0.72)',
        border: `1px solid ${accent}40`,
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        boxShadow: `0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px ${accent}10 inset`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 20%, ${accent}16 0%, transparent 65%)` }} />
      <div className="absolute top-0 left-3 right-3 h-[1.5px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="relative flex flex-col items-center gap-1">
        <div style={{ color: accent, opacity: 0.55 }}>{icon}</div>
        <span className="font-display text-3xl sm:text-4xl leading-none tabular-nums" style={{ color: '#fff', textShadow: `0 0 28px ${accent}65, 0 2px 8px rgba(0,0,0,0.9)` }}>{value}</span>
        <span className="text-[10px] font-mono tracking-widest uppercase whitespace-nowrap" style={{ color: accent, opacity: 0.7 }}>{label}</span>
      </div>
    </motion.div>
  )
}

interface StatsRowProps { todayCount: number; liveCount: number; totalGoals: number }
function StatsRow({ todayCount, liveCount, totalGoals }: StatsRowProps) {
  const items: StatItem[] = [
    { value: '48',                    label: 'Nations',   accent: '#6090ff', icon: <Star className="w-3.5 h-3.5" />,     delay: 0.65 },
    { value: '104',                   label: 'Matches',   accent: '#30d97a', icon: <Calendar className="w-3.5 h-3.5" />, delay: 0.70 },
    { value: String(totalGoals || 0), label: 'Goals',     accent: '#e8b84b', icon: <Target className="w-3.5 h-3.5" />,   delay: 0.75 },
    { value: String(todayCount),      label: liveCount > 0 ? 'Live Now' : 'Today', accent: liveCount > 0 ? '#ef4444' : '#c060ff', icon: <Zap className="w-3.5 h-3.5" />, delay: 0.80 },
  ]
  return (
    <div className="flex gap-2.5 justify-center flex-wrap">
      {items.map(item => <StatPill key={item.label} {...item} />)}
    </div>
  )
}

// ─── Nav cards — each with distinct visual identity ───────────────────────────

// Card 1 · Schedule — left-bar + big number + fixture hints
function ScheduleCard({ todayCount, liveCount }: { todayCount: number; liveCount: number }) {
  const isLive = liveCount > 0
  return (
    <Link href="/schedule" className="group block h-full">
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(8,22,80,0.5)',
          border: '1px solid rgba(96,144,255,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.4)',
        }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(60,100,255,0.25) 0%, transparent 65%)' }} />
        {/* Left accent bar */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background: 'linear-gradient(to bottom, #6090ff, rgba(96,144,255,0.2))' }} />
        {/* Top shimmer */}
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(96,144,255,0.7), transparent)' }} />

        <div className="relative flex flex-col justify-between h-full pl-5 pr-4 pt-4 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: '#6090ff' }}>Schedule</span>
            <Calendar className="w-4 h-4 opacity-30" style={{ color: '#6090ff' }} />
          </div>

          {/* Big number focal point */}
          <div>
            <div className="flex items-end gap-1.5">
              <span className="font-display leading-none" style={{ fontSize: 56, color: '#fff', textShadow: '0 0 40px rgba(96,144,255,0.6), 0 2px 12px rgba(0,0,0,0.9)' }}>
                {isLive ? liveCount : todayCount}
              </span>
              {isLive && <span className="mb-2 flex items-center gap-1 text-[10px] font-mono font-bold text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />LIVE</span>}
            </div>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isLive ? 'matches live' : 'matches today'}
            </p>
          </div>

          {/* Fixture hint lines */}
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map(k => (
              <div key={k} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(96,144,255,0.4)' }} />
                <div className="h-[1px] flex-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-[1px] w-6 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: '#6090ff' }}>
            <span>All fixtures</span><ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Card 2 · Standings — animated rank bars, leaderboard feel
function StandingsCard() {
  const rows = [
    { label: '1st', width: '88%', pts: '9' },
    { label: '2nd', width: '67%', pts: '6' },
    { label: '3rd', width: '44%', pts: '4' },
  ]
  return (
    <Link href="/standings" className="group block h-full">
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(0,52,22,0.5)',
          border: '1px solid rgba(40,220,100,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(0,200,80,0.22) 0%, transparent 65%)' }} />
        {/* Diagonal stripe texture top-right */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-2xl pointer-events-none opacity-40">
          <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(48,217,122,0.12) 3px, rgba(48,217,122,0.12) 6px)' }} />
        </div>
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(40,220,100,0.65), transparent)' }} />

        <div className="relative flex flex-col justify-between h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-display text-[22px] leading-none tracking-wide" style={{ color: '#90ffbc', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>Standings</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(48,217,122,0.14)', color: '#30d97a', border: '1px solid rgba(48,217,122,0.28)' }}>
              12 GROUPS
            </span>
          </div>

          {/* Rank bars */}
          <div className="flex flex-col gap-2.5">
            {rows.map(({ label, width, pts }, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[9px] font-mono w-5 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width }}
                    transition={{ delay: 1.0 + i * 0.1, duration: 0.7, ease: E }}
                    className="h-full rounded-md"
                    style={{ background: `linear-gradient(90deg, rgba(48,217,122,0.35), ${i === 0 ? '#30d97a' : i === 1 ? '#30d97aaa' : '#30d97a70'})` }}
                  />
                </div>
                <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{pts}pts</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: '#30d97a' }}>
            <span>All groups</span><ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Card 3 · Top Scorers — trophy/award, centered portrait feel
function ScorersCard() {
  return (
    <Link href="/scorers" className="group block h-full">
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(70,42,0,0.5)',
          border: '1px solid rgba(232,184,75,0.45)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.4)',
        }}
      >
        {/* Central radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(232,184,75,0.18) 0%, transparent 68%)' }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(232,184,75,0.28) 0%, transparent 65%)' }} />
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,75,0.75), transparent)' }} />
        {/* Decorative corner stars */}
        <div className="absolute top-3 left-3 text-[10px] opacity-20" style={{ color: '#e8b84b' }}>★</div>
        <div className="absolute top-3 right-3 text-[10px] opacity-20" style={{ color: '#e8b84b' }}>★</div>

        <div className="relative flex flex-col items-center justify-between h-full p-4 text-center">
          {/* Trophy icon */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Trophy className="w-9 h-9" style={{ color: '#e8b84b', filter: 'drop-shadow(0 0 16px rgba(232,184,75,0.7))' }} />
            </div>
            <div className="text-[9px] font-mono tracking-[0.2em] mt-0.5" style={{ color: 'rgba(232,184,75,0.5)' }}>GOLDEN BOOT</div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-display text-[22px] leading-none tracking-wide" style={{ color: '#ffd87a', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>Top Scorers</h3>
            <p className="text-[11px] font-mono mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Goals · Assists · Rankings</p>
          </div>

          {/* Mini dividers as decorative pills */}
          <div className="flex items-center gap-2">
            {['Goals', 'Assists'].map((t, i) => (
              <div key={t} className="px-2.5 py-1 rounded-full text-[10px] font-mono" style={{ background: 'rgba(232,184,75,0.12)', color: 'rgba(232,184,75,0.65)', border: '1px solid rgba(232,184,75,0.2)' }}>
                {t}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: '#e8b84b' }}>
            <span>View rankings</span><ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Card 4 · Bracket — tournament stage progression
function BracketCard() {
  const stages = [
    { label: 'R32', blocks: 8, done: true },
    { label: 'R16', blocks: 4, done: true },
    { label: 'QF',  blocks: 2, done: false },
    { label: 'SF',  blocks: 1, done: false },
    { label: 'F',   blocks: 1, done: false },
  ]
  return (
    <Link href="/bracket" className="group block h-full">
      <div
        className="relative h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(44,8,80,0.5)',
          border: '1px solid rgba(180,80,255,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(160,60,240,0.25) 0%, transparent 65%)' }} />
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,80,255,0.7), transparent)' }} />

        <div className="relative flex flex-col justify-between h-full p-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 opacity-70" style={{ color: '#c060ff' }} />
            <span className="font-display text-[22px] leading-none tracking-wide" style={{ color: '#e0a0ff', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>Bracket</span>
          </div>

          {/* Stage blocks */}
          <div className="flex flex-col gap-1.5">
            {stages.map(({ label, blocks, done }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.05 + i * 0.06, duration: 0.4, ease: E }}
                className="flex items-center gap-2"
              >
                <span className="text-[9px] font-mono w-5" style={{ color: done ? 'rgba(192,96,255,0.4)' : '#c060ff' }}>{label}</span>
                <div className="flex gap-0.5 items-center flex-1">
                  {Array.from({ length: blocks }).map((_, j) => (
                    <div
                      key={j}
                      className="h-3.5 rounded-sm flex-1"
                      style={{ background: done ? 'rgba(192,96,255,0.12)' : `rgba(192,96,255,${0.35 + j * 0.05})`, border: done ? '1px solid rgba(192,96,255,0.15)' : '1px solid rgba(192,96,255,0.4)' }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: '#c060ff' }}>
            <span>Full bracket</span><ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function NavCards({ todayCount, liveCount }: { todayCount: number; liveCount: number }) {
  const cards = [
    { delay: 0.88, node: <ScheduleCard todayCount={todayCount} liveCount={liveCount} /> },
    { delay: 0.95, node: <StandingsCard /> },
    { delay: 1.02, node: <ScorersCard /> },
    { delay: 1.09, node: <BracketCard /> },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl mx-auto">
      {cards.map(({ delay, node }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.5, ease: E }}
          className="h-full"
        >
          {node}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
interface HeroPageProps { todayCount: number; liveCount: number; totalGoals: number }

export function HeroPage({ todayCount, liveCount, totalGoals }: HeroPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#060a12' }}>

      {/* Background image — Next.js Image for crisp rendering */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          quality={100}
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/28 pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 h-52 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.82), transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-[62%] pointer-events-none z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, transparent 100%)' }} />
      <div className="absolute inset-y-0 left-0 w-28 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.38), transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-28 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.38), transparent)' }} />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-between min-h-screen pt-14 px-4">

        {/* Live pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: E }}
          className="mt-4"
        >
          <div
            className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold px-4 py-1.5 rounded-full tracking-widest"
            style={{
              background: 'rgba(0,0,0,0.58)',
              border: '1px solid rgba(255,255,255,0.13)',
              backdropFilter: 'blur(14px)',
              color: 'rgba(255,255,255,0.82)',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-live-pulse" />
            {liveCount > 0 ? `${liveCount} LIVE · ` : ''}FIFA WORLD CUP 2026 · IN PROGRESS
          </div>
        </motion.div>

        {/* Center */}
        <div className="flex flex-col items-center text-center gap-6 -mt-16 md:-mt-20">
          {/* Title */}
          <div className="flex flex-col items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.65, ease: E }}
              className="font-display leading-none tracking-wider"
              style={{ fontSize: 'clamp(48px, 10vw, 96px)', color: '#ffffff', textShadow: '0 0 80px rgba(0,0,0,0.97), 0 4px 20px rgba(0,0,0,0.97)' }}
            >
              WORLD CUP
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.65, ease: E }}
              className="font-display leading-none tracking-widest"
              style={{
                fontSize: 'clamp(72px, 18vw, 168px)',
                WebkitTextStroke: '2.5px #e8b84b',
                color: 'transparent',
                filter: 'drop-shadow(0 0 48px rgba(232,184,75,0.55)) drop-shadow(0 4px 24px rgba(0,0,0,0.97))',
                marginTop: '-0.06em',
              }}
            >
              2026
            </motion.div>
          </div>

          <HostNations />
          <StatsRow todayCount={todayCount} liveCount={liveCount} totalGoals={totalGoals} />
        </div>

        {/* Nav cards */}
        <div className="w-full pb-8">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.45 }}
            className="text-center text-[10px] font-mono tracking-[0.25em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            Explore the tournament
          </motion.p>
          <NavCards todayCount={todayCount} liveCount={liveCount} />
        </div>
      </div>
    </div>
  )
}
