'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Footprints, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Scorer } from '@/types/scorers'
import type { PlayerMatchEvent } from '@/app/api/scorers/player-detail/route'
import { cn } from '@/lib/utils'

interface Props {
  scorer: Scorer | null
  type: 'goals' | 'assists'
  enhancedPhotoUrl?: string | null
  onClose: () => void
}

function EventIcon({ type }: { type: PlayerMatchEvent['type'] }) {
  if (type === 'assist') return <span className="text-[14px]">🅰️</span>
  if (type === 'penalty') return <span className="text-[14px]">🅿️</span>
  return <span className="text-[14px]">⚽</span>
}

function EventRow({ evt, index }: { evt: PlayerMatchEvent; index: number }) {
  const date = new Date(evt.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short',
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22, ease: 'easeOut' }}
      className="flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
    >
      {/* Opponent */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamFlag logoUrl={evt.opponentLogoUrl ?? ''} name={evt.opponentName} size="sm" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-text-primary truncate">
            vs {evt.opponentAbbr}
          </p>
          <p className="text-[10px] text-text-muted font-mono">{date}</p>
        </div>
      </div>

      {/* Score snapshot */}
      {evt.scoreSnapshot && (
        <span className="text-[11px] font-mono text-text-muted shrink-0 hidden sm:block">
          {evt.scoreSnapshot}
        </span>
      )}

      {/* Minute */}
      <span className="text-[12px] font-mono text-text-muted shrink-0 w-10 text-right">
        {evt.minute}&apos;
      </span>

      {/* Type icon */}
      <div className="shrink-0 w-6 flex justify-center">
        <EventIcon type={evt.type} />
      </div>
    </motion.div>
  )
}

export function PlayerDetailModal({ scorer, type, enhancedPhotoUrl, onClose }: Props) {
  const [events, setEvents]   = useState<PlayerMatchEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(async (name: string, t: 'goals' | 'assists') => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        `/api/scorers/player-detail?name=${encodeURIComponent(name)}&type=${t}`,
      )
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json() as { events: PlayerMatchEvent[] }
      setEvents(data.events)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!scorer) { setEvents([]); return }
    fetchData(scorer.athlete.displayName, type)

    // Auto-refresh every 60s while modal is open
    const id = setInterval(() => fetchData(scorer.athlete.displayName, type), 60_000)
    return () => clearInterval(id)
  }, [scorer, type, fetchData])

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = scorer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [scorer])

  const photoUrl = enhancedPhotoUrl !== undefined ? enhancedPhotoUrl : scorer?.athlete.photoUrl
  const statValue = type === 'goals' ? scorer?.goals : scorer?.assists
  const label = type === 'goals' ? 'goals' : 'assists'

  // Group events by opponent for summary
  const byOpponent = events.reduce<Record<string, number>>((acc, evt) => {
    acc[evt.opponentName] = (acc[evt.opponentName] || 0) + 1
    return acc
  }, {})

  return (
    <AnimatePresence>
      {scorer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-[520px] max-h-[85vh] flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: '#07101f' }}
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
              {/* Avatar */}
              <div className="relative w-12 h-12 shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-elevated border border-white/10">
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-text-muted bg-gradient-to-br from-[#1a2540] to-[#111827]">
                    {scorer.athlete.shortName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  {photoUrl && (
                    <Image
                      src={photoUrl}
                      alt={scorer.athlete.displayName}
                      fill
                      className="object-cover object-top"
                      unoptimized
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white truncate">{scorer.athlete.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TeamFlag logoUrl={scorer.team.logoUrl} name={scorer.team.name} size="sm" />
                  <span className="text-[11px] text-text-muted">{scorer.team.abbreviation}</span>
                  {scorer.athlete.position && (
                    <span className="text-[10px] font-mono text-text-muted/50 border border-border/30 rounded px-1 leading-4">
                      {scorer.athlete.position}
                    </span>
                  )}
                </div>
              </div>

              {/* Stat total */}
              <div className="shrink-0 text-right mr-2">
                <span className="font-display text-3xl font-bold text-white leading-none">{statValue}</span>
                <p className="text-[10px] text-text-muted capitalize mt-0.5">{label}</p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subheader: breakdown by opponent (compact pills) */}
            {!loading && events.length > 0 && Object.keys(byOpponent).length > 1 && (
              <div className="flex items-center gap-1.5 px-5 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide shrink-0">
                {Object.entries(byOpponent)
                  .sort(([, a], [, b]) => b - a)
                  .map(([opp, count]) => (
                    <span
                      key={opp}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0"
                      style={{ background: 'rgba(96,144,255,0.12)', border: '1px solid rgba(96,144,255,0.25)', color: '#90b8ff' }}
                    >
                      {count}× {opp}
                    </span>
                  ))}
              </div>
            )}

            {/* Section title */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 shrink-0">
              {type === 'goals'
                ? <Target className="w-3.5 h-3.5 text-text-muted" />
                : <Footprints className="w-3.5 h-3.5 text-text-muted" />
              }
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                {type === 'goals' ? 'Goals' : 'Assists'} breakdown
              </span>
              {!loading && (
                <span className="text-[10px] font-mono text-text-muted/50 ml-auto">{events.length} total</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-text-muted text-sm">Failed to load data</p>
                  <button
                    onClick={() => fetchData(scorer.athlete.displayName, type)}
                    className="text-xs text-accent-blue hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-6">
                  <span className="text-4xl opacity-20">{type === 'goals' ? '⚽' : '🅰️'}</span>
                  <p className="text-text-muted text-sm">No {label} recorded yet</p>
                  <p className="text-text-muted/50 text-xs">Data updates automatically as matches complete</p>
                </div>
              ) : (
                events.map((evt, i) => <EventRow key={`${evt.matchId}-${evt.minute}`} evt={evt} index={i} />)
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-2.5 border-t border-white/5">
              <p className="text-[10px] font-mono text-text-muted/40 text-center">
                Data from ESPN · auto-refreshes every 60s
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
