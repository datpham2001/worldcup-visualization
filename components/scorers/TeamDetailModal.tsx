'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Users } from 'lucide-react'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { TeamStat } from '@/types/scorers'
import type { TeamDetailPlayer } from '@/app/api/scorers/team-detail/route'
import { cn } from '@/lib/utils'

interface Props {
  stat: TeamStat | null
  onClose: () => void
}

function PlayerLine({ player, index }: { player: TeamDetailPlayer; index: number }) {
  const initials = player.name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, duration: 0.22, ease: 'easeOut' }}
      className="flex items-center gap-3 px-5 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
    >
      {/* Rank */}
      <span className="w-5 text-[11px] font-mono text-text-muted text-center shrink-0">
        {index + 1}
      </span>

      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
        {initials}
      </div>

      {/* Name */}
      <p className="flex-1 text-[13px] font-semibold text-text-primary truncate min-w-0">
        {player.name}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-2 shrink-0">
        {player.goals > 0 && (
          <span className="flex items-center gap-1 text-[12px] font-mono">
            <span className="text-[11px]">⚽</span>
            <span className="text-text-primary font-bold">{player.goals}</span>
          </span>
        )}
        {player.assists > 0 && (
          <span className="flex items-center gap-1 text-[12px] font-mono">
            <span className="text-[11px]">🅰️</span>
            <span className="text-text-muted">{player.assists}</span>
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function TeamDetailModal({ stat, onClose }: Props) {
  const [players, setPlayers] = useState<TeamDetailPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(async (teamId: string) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/scorers/team-detail?teamId=${encodeURIComponent(teamId)}`)
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json() as { players: TeamDetailPlayer[] }
      setPlayers(data.players)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!stat) { setPlayers([]); return }
    fetchData(stat.team.id)

    // Auto-refresh every 60s while open
    const id = setInterval(() => fetchData(stat.team.id), 60_000)
    return () => clearInterval(id)
  }, [stat, fetchData])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = stat ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [stat])

  const totalGoals   = players.reduce((s, p) => s + p.goals, 0)
  const totalAssists = players.reduce((s, p) => s + p.assists, 0)

  return (
    <AnimatePresence>
      {stat && (
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
            className="relative z-10 w-full max-w-[480px] max-h-[80vh] flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: '#07101f' }}
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
              <TeamFlag logoUrl={stat.team.logoUrl} name={stat.team.name} size="lg" />

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white truncate">{stat.team.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {stat.matchesPlayed}GP · {stat.wins}W {stat.draws}D {stat.losses}L
                </p>
              </div>

              {/* Goal tally */}
              <div className="shrink-0 text-right mr-2">
                <span className="font-display text-3xl font-bold text-white leading-none">{stat.goalsFor}</span>
                <p className="text-[10px] text-text-muted mt-0.5">goals</p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary row */}
            {!loading && players.length > 0 && (
              <div className="flex items-center gap-4 px-5 py-2.5 border-b border-white/5 shrink-0">
                <span className="text-[11px] text-text-muted font-mono">
                  {players.length} contributor{players.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] font-mono text-text-muted/50">
                  {totalGoals} goals · {totalAssists} assists
                </span>
              </div>
            )}

            {/* Section title */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 shrink-0">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                Scorers & Assists
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <p className="text-text-muted text-sm">Failed to load data</p>
                  <button
                    onClick={() => fetchData(stat.team.id)}
                    className="text-xs text-accent-blue hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2 text-center px-6">
                  <span className="text-4xl opacity-20">⚽</span>
                  <p className="text-text-muted text-sm">No scorer data available yet</p>
                  <p className="text-text-muted/50 text-xs">Data updates as matches complete</p>
                </div>
              ) : (
                players.map((p, i) => <PlayerLine key={p.name} player={p} index={i} />)
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-2.5 border-t border-white/5">
              <p className="text-[10px] font-mono text-text-muted/40 text-center">
                From match event data · auto-refreshes every 60s
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
