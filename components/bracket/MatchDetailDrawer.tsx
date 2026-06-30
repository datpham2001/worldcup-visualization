'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Play, ExternalLink, Clock } from 'lucide-react'
import { TeamFlag } from '@/components/shared/TeamFlag'
import { MatchTimeline } from '@/components/match/MatchTimeline'
import { MatchStats } from '@/components/match/MatchStats'
import { MatchLineup } from '@/components/match/MatchLineup'
import type { MatchDetail, MatchVideo } from '@/types/match'
import { cn } from '@/lib/utils'
import { useTimezone } from '@/lib/hooks/useTimezone'
import { fmtTime, fmtDateLong } from '@/lib/timezone'

interface Props {
  matchId: string | null
  onClose: () => void
}

type DrawerTab = 'events' | 'stats' | 'lineup'

// ─── Score header ─────────────────────────────────────────────────────────────

function ModalHeader({ match }: { match: MatchDetail }) {
  const { timezone } = useTimezone()
  const homeWon = match.status === 'post' && match.homeWinner
  const awayWon = match.status === 'post' && match.awayWinner

  return (
    <div className="px-6 py-5 border-b border-white/6">
      <div className="flex items-center gap-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <TeamFlag logoUrl={match.homeTeam.logoUrl} name={match.homeTeam.name} size="lg" />
          <p className={cn('text-[13px] font-bold leading-tight', homeWon ? 'text-white' : 'text-white/60')}>
            {match.homeTeam.shortName || match.homeTeam.abbreviation}
          </p>
        </div>

        {/* Score / VS */}
        <div className="shrink-0 flex flex-col items-center gap-1 min-w-[90px]">
          {match.status !== 'pre' ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className={cn('font-display text-[46px] leading-none tabular-nums', homeWon ? 'text-white' : 'text-white/45')}>
                  {match.homeScore ?? 0}
                </span>
                <span className="text-white/20 text-xl font-light">:</span>
                <span className={cn('font-display text-[46px] leading-none tabular-nums', awayWon ? 'text-white' : 'text-white/45')}>
                  {match.awayScore ?? 0}
                </span>
              </div>
              {match.status === 'post' && (
                <span className="text-[10px] font-mono text-white/30 tracking-widest">FULL TIME</span>
              )}
              {match.status === 'in' && (
                <span className="text-[11px] text-red-400 font-mono">
                  {match.clock ? `${match.clock}′` : 'LIVE'}
                </span>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-white/20 text-base font-mono">VS</span>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-[12px] font-bold text-[#e8b84b] font-mono">
                  {fmtTime(match.date, timezone.tz, timezone.abbr)}
                </span>
                <span className="text-[10px] text-white/30 font-mono">
                  {fmtDateLong(match.date, timezone.tz)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <TeamFlag logoUrl={match.awayTeam.logoUrl} name={match.awayTeam.name} size="lg" />
          <p className={cn('text-[13px] font-bold leading-tight', awayWon ? 'text-white' : 'text-white/60')}>
            {match.awayTeam.shortName || match.awayTeam.abbreviation}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/30 font-mono flex-wrap">
        {match.status === 'post' && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {fmtDateLong(match.date, timezone.tz)}
          </span>
        )}
        {match.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}{match.venueCity ? `, ${match.venueCity}` : ''}
          </span>
        )}
        {match.attendance && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {match.attendance.toLocaleString()} att.
          </span>
        )}
      </div>

      {match.homeFormation && match.awayFormation && (
        <div className="flex justify-between mt-2 px-4 text-[10px] font-mono text-white/20">
          <span>{match.homeFormation}</span>
          <span>{match.awayFormation}</span>
        </div>
      )}
    </div>
  )
}

// ─── Video strip ──────────────────────────────────────────────────────────────

function VideoStrip({ videos }: { videos: MatchVideo[] }) {
  if (videos.length === 0) return null

  return (
    <div className="border-b border-white/6 py-3">
      <div className="flex items-center gap-2 px-5 mb-2.5">
        <Play className="w-3 h-3 text-white/30" />
        <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Highlights</span>
        <span className="text-[9px] font-mono text-white/18">{videos.length} clips</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-5 pb-0.5 scrollbar-hide">
        {videos.map(video => (
          <a
            key={video.id}
            href={video.webLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 w-[160px] rounded-xl overflow-hidden border border-white/8 hover:border-white/22 transition-all duration-200"
          >
            <div className="relative" style={{ aspectRatio: '16/9' }}>
              {video.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.thumbnail} alt={video.headline} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute top-1.5 right-1.5 bg-black/65 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
                <ExternalLink className="w-2.5 h-2.5 text-white/55" />
                <span className="text-[8px] font-bold text-white/55 tracking-wider">ESPN</span>
              </div>
            </div>
            <div className="px-2 py-2">
              <p className="text-[10px] text-white/50 leading-snug line-clamp-2 group-hover:text-white/75 transition-colors">
                {video.headline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

interface TabBarProps {
  tab: DrawerTab
  onChange: (t: DrawerTab) => void
  hasStats: boolean
  hasLineup: boolean
}

function TabBar({ tab, onChange, hasStats, hasLineup }: TabBarProps) {
  const tabs: { id: DrawerTab; label: string; disabled?: boolean }[] = [
    { id: 'events', label: 'Events' },
    { id: 'stats',  label: 'Statistics', disabled: !hasStats },
    { id: 'lineup', label: 'Lineup',     disabled: !hasLineup },
  ]

  return (
    <div className="flex border-b border-white/6 shrink-0">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          disabled={t.disabled}
          className={cn(
            'flex-1 py-2.5 text-[12px] font-semibold transition-all duration-150',
            tab === t.id
              ? 'text-white border-b-2 border-white/55 -mb-px'
              : 'text-white/30 hover:text-white/60',
            t.disabled && 'opacity-20 cursor-not-allowed',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <div className="p-6 space-y-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-white/8" />
          <div className="w-10 h-3 bg-white/8 rounded" />
        </div>
        <div className="w-24 h-12 bg-white/8 rounded" />
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-white/8" />
          <div className="w-10 h-3 bg-white/8 rounded" />
        </div>
      </div>
      <div className="space-y-2 mt-6">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-9 bg-white/5 rounded-lg" style={{ opacity: 1 - i * 0.11 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Pre-match info ───────────────────────────────────────────────────────────

function PreMatchInfo({ match }: { match: MatchDetail }) {
  const { timezone } = useTimezone()
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center px-8">
      <div className="text-5xl">⏰</div>
      <div>
        <p className="text-white/55 text-[15px] font-semibold mb-1">Kick-off</p>
        <p className="text-[#e8b84b] text-[22px] font-bold font-mono">{fmtTime(match.date, timezone.tz, timezone.abbr)}</p>
        <p className="text-white/30 text-[12px] font-mono mt-1">{fmtDateLong(match.date, timezone.tz)}</p>
      </div>
      {match.venue && (
        <p className="text-white/25 text-[11px] flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          {match.venue}{match.venueCity ? `, ${match.venueCity}` : ''}
        </p>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function MatchDetailDrawer({ matchId, onClose }: Props) {
  const [match, setMatch]     = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState<DrawerTab>('events')
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMatch = useCallback(async (id: string, showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const res = await fetch(`/api/matches/${id}`)
      if (res.ok) setMatch(await res.json() as MatchDetail)
    } catch { /* silent */ }
    finally { if (showLoader) setLoading(false) }
  }, [])

  useEffect(() => {
    if (!matchId) { setMatch(null); return }
    setTab('events')
    fetchMatch(matchId, true)
  }, [matchId, fetchMatch])

  // Adaptive polling
  useEffect(() => {
    if (!matchId) return
    if (pollRef.current) clearInterval(pollRef.current)
    const ms = match?.status === 'in' ? 30_000 : 120_000
    pollRef.current = setInterval(() => fetchMatch(matchId), ms)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [matchId, match?.status, fetchMatch])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = matchId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [matchId])

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const hasStats  = (match?.stats.length ?? 0) > 0
  const hasEvents = (match?.events.length ?? 0) > 0
  const hasLineup = (match?.homeLineup.length ?? 0) > 0 || (match?.awayLineup.length ?? 0) > 0
  const hasVideos = (match?.videos.length ?? 0) > 0

  return (
    <AnimatePresence>
      {matchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-[540px] max-h-[88vh] bg-[#07101f] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/6 shrink-0">
              <div className="flex-1 min-w-0">
                {match ? (
                  <span className="text-[10px] font-mono text-white/28 uppercase tracking-widest truncate block">
                    {match.group ? `${match.group} · ${match.round}` : match.round}
                  </span>
                ) : (
                  <div className="h-3 w-24 bg-white/8 rounded animate-pulse" />
                )}
              </div>

              {match?.status === 'in' && (
                <motion.span
                  className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  LIVE{match.clock ? ` · ${match.clock}′` : ''}
                </motion.span>
              )}

              {match?.status === 'post' && (
                <span className="text-[9px] font-mono text-white/22 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                  FT
                </span>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-all shrink-0 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {loading ? (
                <div className="overflow-y-auto flex-1">
                  <ModalSkeleton />
                </div>
              ) : match ? (
                <>
                  {/* Score header */}
                  <motion.div
                    className="shrink-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <ModalHeader match={match} />
                  </motion.div>

                  {/* Video highlights strip */}
                  {hasVideos && (
                    <motion.div
                      className="shrink-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.25 }}
                    >
                      <VideoStrip videos={match.videos} />
                    </motion.div>
                  )}

                  {/* Tabs + content for started matches */}
                  {match.status !== 'pre' ? (
                    <>
                      <div className="shrink-0">
                        <TabBar tab={tab} onChange={setTab} hasStats={hasStats} hasLineup={hasLineup} />
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                            className="p-5"
                          >
                            {tab === 'events' && (
                              hasEvents ? (
                                <MatchTimeline
                                  events={match.events}
                                  homeTeamName={match.homeTeam.abbreviation}
                                  awayTeamName={match.awayTeam.abbreviation}
                                />
                              ) : (
                                <p className="text-center text-white/28 text-sm py-12">No events recorded</p>
                              )
                            )}
                            {tab === 'stats' && <MatchStats stats={match.stats} />}
                            {tab === 'lineup' && (
                              <MatchLineup
                                homeLineup={match.homeLineup}
                                awayLineup={match.awayLineup}
                                homeFormation={match.homeFormation}
                                awayFormation={match.awayFormation}
                                homeTeamName={match.homeTeam.abbreviation}
                                awayTeamName={match.awayTeam.abbreviation}
                              />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <PreMatchInfo match={match} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="shrink-0 px-5 py-3 border-t border-white/6 text-center">
                    <a
                      href={`/matches/${match.id}`}
                      className="text-[11px] text-white/22 hover:text-white/50 transition-colors font-mono"
                    >
                      View full match page ↗
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center flex-1 py-16 text-white/25 text-sm">
                  Failed to load match data
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
