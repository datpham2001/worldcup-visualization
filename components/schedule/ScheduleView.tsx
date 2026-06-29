'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MatchCard } from './MatchCard'
import { MatchDetailDrawer } from '@/components/bracket/MatchDetailDrawer'
import type { Match } from '@/types/match'
import { cn } from '@/lib/utils'
import { RefreshCw, Calendar, Globe2, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Round detection ──────────────────────────────────────────────────────────
function getRoundId(m: Match): RoundFilter {
  const slug = (m.round || '').toLowerCase()
  if (slug.includes('group'))   return 'groups'
  if (slug.includes('32'))      return 'r32'
  if (slug.includes('16'))      return 'r16'
  if (slug.includes('quarter')) return 'qf'
  if (slug.includes('semi'))    return 'sf'
  if (slug.includes('third') || slug.includes('3rd') || slug.includes('place')) return '3rd'
  if (slug.includes('final'))   return 'final'
  // Fallback: group stage matches often have a group note
  if (m.group) return 'groups'
  return 'groups'
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type StatusFilter = 'all' | 'live' | 'upcoming' | 'completed'
type RoundFilter  = 'all' | 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'

function byStatus(matches: Match[], s: StatusFilter): Match[] {
  if (s === 'all') return matches
  const map = { live: 'in', upcoming: 'pre', completed: 'post' } as const
  return matches.filter(m => m.status === map[s])
}
function byRound(matches: Match[], r: RoundFilter): Match[] {
  if (r === 'all') return matches
  return matches.filter(m => getRoundId(m) === r)
}
function filter(matches: Match[], s: StatusFilter, r: RoundFilter): Match[] {
  return byRound(byStatus(matches, s), r)
}

// ─── VN date helpers ──────────────────────────────────────────────────────────
function vnKey(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}
function vnLabel(key: string) {
  const now = new Date()
  const tz  = 'Asia/Ho_Chi_Minh'
  const tok  = now.toLocaleDateString('en-CA', { timeZone: tz })
  const tmk  = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const ysk  = new Date(now.getTime() - 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const fmt  = new Date(key + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  if (key === tok) return `Today · ${fmt}`
  if (key === tmk) return `Tomorrow · ${fmt}`
  if (key === ysk) return `Yesterday · ${fmt}`
  return fmt
}
function groupByVNDate(matches: Match[], desc = false) {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const k = vnKey(m.date)
    map.set(k, [...(map.get(k) || []), m])
  }
  return [...map.entries()]
    .sort(([a], [b]) => desc ? b.localeCompare(a) : a.localeCompare(b))
    .map(([key, ms]) => ({ key, matches: ms }))
}

// ─── Chip button ──────────────────────────────────────────────────────────────
interface ChipProps {
  active: boolean
  label: string
  count?: number
  accent?: string
  dot?: boolean
  disabled?: boolean
  onClick: () => void
}
function Chip({ active, label, count, accent = '#6090ff', dot, disabled, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 border shrink-0',
        disabled
          ? 'border-border text-text-muted opacity-35 cursor-default'
          : active
          ? 'text-white border-transparent'
          : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-white/20',
      )}
      style={active && !disabled ? { background: `${accent}28`, border: `1px solid ${accent}60`, color: accent } : undefined}
    >
      {dot && active && (
        <span className="w-1.5 h-1.5 rounded-full animate-live-pulse shrink-0" style={{ background: accent }} />
      )}
      {dot && !active && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50" style={{ background: accent }} />
      )}
      {label}
      {count !== undefined && (
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
          style={{ background: active ? `${accent}30` : 'rgba(255,255,255,0.06)', color: active ? accent : 'rgba(255,255,255,0.3)' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Date group + grid ────────────────────────────────────────────────────────
interface DateSectionProps {
  label: string
  matches: Match[]
  onMatchDetail?: (id: string) => void
}

function DateSection({ label, matches, onMatchDetail }: DateSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[10px] font-mono text-text-muted">{matches.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {matches.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025, duration: 0.25 }}>
            <MatchCard match={m} onMatchDetail={onMatchDetail} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Match list renderer ──────────────────────────────────────────────────────
interface MatchListProps {
  matches: Match[]
  status: StatusFilter
  showAllCompleted: boolean
  onToggleCompleted: () => void
  onMatchDetail?: (id: string) => void
}
function MatchList({ matches, status, showAllCompleted, onToggleCompleted, onMatchDetail }: MatchListProps) {
  const live      = matches.filter(m => m.status === 'in')
  const upcoming  = matches.filter(m => m.status === 'pre').sort((a, b) => +new Date(a.date) - +new Date(b.date))
  const completed = matches.filter(m => m.status === 'post').sort((a, b) => +new Date(b.date) - +new Date(a.date))

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <span className="text-4xl opacity-20">🔍</span>
        <p className="text-text-muted text-sm">No matches found for the selected filters.</p>
      </div>
    )
  }

  // When filtering by a specific status, show flat grouped view
  if (status === 'live') {
    return (
      <div className="space-y-6">
        {groupByVNDate(live).map(({ key, matches }) => (
          <DateSection key={key} label={vnLabel(key)} matches={matches} onMatchDetail={onMatchDetail} />
        ))}
      </div>
    )
  }
  if (status === 'upcoming') {
    return (
      <div className="space-y-6">
        {groupByVNDate(upcoming).map(({ key, matches }) => (
          <DateSection key={key} label={vnLabel(key)} matches={matches} onMatchDetail={onMatchDetail} />
        ))}
      </div>
    )
  }
  if (status === 'completed') {
    return (
      <div className="space-y-6">
        {groupByVNDate(completed, true).map(({ key, matches }) => (
          <DateSection key={key} label={vnLabel(key)} matches={matches} onMatchDetail={onMatchDetail} />
        ))}
      </div>
    )
  }

  // Default 'all' status: Live → Upcoming → Completed
  return (
    <div className="space-y-8">
      {/* Live */}
      {live.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-live-pulse" />
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-red-400">Live Now</span>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/40 to-transparent" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>{live.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {live.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MatchCard match={m} onMatchDetail={onMatchDetail} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#6090ff]">Upcoming</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#6090ff]/40 to-transparent" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(96,144,255,0.15)', color: '#6090ff', border: '1px solid rgba(96,144,255,0.3)' }}>{upcoming.length}</span>
          </div>
          <div className="space-y-6">
            {groupByVNDate(upcoming).map(({ key, matches }) => (
              <DateSection key={key} label={vnLabel(key)} matches={matches} onMatchDetail={onMatchDetail} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#30d97a]">Completed</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#30d97a]/40 to-transparent" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(48,217,122,0.15)', color: '#30d97a', border: '1px solid rgba(48,217,122,0.3)' }}>{completed.length}</span>
            <button
              onClick={onToggleCompleted}
              className="flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors ml-1"
            >
              {showAllCompleted ? <><ChevronUp className="w-3 h-3" />Hide</> : <><ChevronDown className="w-3 h-3" />Show all</>}
            </button>
          </div>

          {/* Always show the most-recent day */}
          {(() => {
            const latestKey = vnKey(completed[0].date)
            const latest = completed.filter(m => vnKey(m.date) === latestKey)
            return (
              <div className="space-y-6">
                <DateSection label={vnLabel(latestKey)} matches={latest} />
                {completed.length > latest.length && (
                  <AnimatePresence>
                    {showAllCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                        className="space-y-6 overflow-hidden"
                      >
                        {groupByVNDate(completed.filter(m => vnKey(m.date) !== latestKey), true).map(({ key, matches }) => (
                          <DateSection key={key} label={vnLabel(key)} matches={matches} onMatchDetail={onMatchDetail} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                {!showAllCompleted && completed.length > latest.length && (
                  <button onClick={onToggleCompleted} className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                    Show {completed.length - latest.length} more completed matches
                  </button>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ─── Filter strip ─────────────────────────────────────────────────────────────
interface FilterStripProps {
  source: Match[]
  status: StatusFilter
  round: RoundFilter
  showStage: boolean
  onStatus: (s: StatusFilter) => void
  onRound: (r: RoundFilter) => void
}

function FilterStrip({ source, status, round, showStage, onStatus, onRound }: FilterStripProps) {
  const roundFiltered  = useMemo(() => byRound(source, round), [source, round])
  const statusFiltered = useMemo(() => byStatus(source, status), [source, status])

  const sCounts = useMemo(() => ({
    all:       roundFiltered.length,
    live:      roundFiltered.filter(m => m.status === 'in').length,
    upcoming:  roundFiltered.filter(m => m.status === 'pre').length,
    completed: roundFiltered.filter(m => m.status === 'post').length,
  }), [roundFiltered])

  const rCounts = useMemo(() => {
    const cnt = (r: RoundFilter) => statusFiltered.filter(m => getRoundId(m) === r).length
    return { groups: cnt('groups'), r32: cnt('r32'), r16: cnt('r16'), qf: cnt('qf'), sf: cnt('sf'), '3rd': cnt('3rd'), final: cnt('final') }
  }, [statusFiltered])

  const statusChips: { id: StatusFilter; label: string; accent: string; dot?: boolean }[] = [
    { id: 'all',       label: 'All',       accent: '#6090ff' },
    { id: 'live',      label: 'Live',      accent: '#ef4444', dot: true },
    { id: 'upcoming',  label: 'Upcoming',  accent: '#6090ff' },
    { id: 'completed', label: 'Completed', accent: '#30d97a' },
  ]

  const roundChips: { id: RoundFilter; label: string; count: number }[] = [
    { id: 'all',    label: 'All Rounds',    count: source.length },
    { id: 'groups', label: 'Group Stage',   count: rCounts.groups },
    { id: 'r32',    label: 'Round of 32',   count: rCounts.r32 },
    { id: 'r16',    label: 'Round of 16',   count: rCounts.r16 },
    { id: 'qf',     label: 'Quarter-finals', count: rCounts.qf },
    { id: 'sf',     label: 'Semi-finals',   count: rCounts.sf },
    { id: '3rd',    label: 'Third Place',   count: rCounts['3rd'] },
    { id: 'final',  label: 'Final',         count: rCounts.final },
  ]

  return (
    <div className="mb-6 space-y-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {statusChips.map(c => (
          <Chip
            key={c.id}
            active={status === c.id}
            label={c.label}
            count={sCounts[c.id]}
            accent={c.accent}
            dot={c.dot}
            disabled={c.id !== 'all' && sCounts[c.id] === 0}
            onClick={() => onStatus(c.id)}
          />
        ))}
      </div>
      {showStage && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {roundChips.map(c => (
            <Chip
              key={c.id}
              active={round === c.id}
              label={c.label}
              count={c.id !== 'all' ? c.count : undefined}
              accent="#e8b84b"
              disabled={c.id !== 'all' && c.count === 0}
              onClick={() => onRound(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface ScheduleViewProps {
  initialToday: Match[]
  initialAll: Match[]
}

export function ScheduleView({ initialToday, initialAll }: ScheduleViewProps) {
  const [primaryTab, setPrimaryTab]       = useState<'today' | 'all'>('today')
  const [status,     setStatus]           = useState<StatusFilter>('all')
  const [round,      setRound]            = useState<RoundFilter>('all')
  const [today, setToday]                 = useState<Match[]>(initialToday)
  const [all,   setAll]                   = useState<Match[]>(initialAll)
  const [refreshing, setRefreshing]       = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [selectedMatchId, setSelectedMatchId]   = useState<string | null>(null)

  const anyLive = useMemo(() => [...today, ...all].some(m => m.status === 'in'), [today, all])
  const pollMs  = anyLive ? 30_000 : 120_000

  const refresh = useCallback(async (indicator = false) => {
    if (indicator) setRefreshing(true)
    try {
      const [td, al] = await Promise.all([
        fetch('/api/scoreboard').then(r => r.json() as Promise<Match[]>),
        fetch('/api/schedule/all').then(r => r.json() as Promise<Match[]>),
      ])
      setToday(td)
      setAll(al)
    } catch { /* silent */ }
    if (indicator) setRefreshing(false)
  }, [])

  useEffect(() => {
    const id = setInterval(() => refresh(), pollMs)
    return () => clearInterval(id)
  }, [refresh, pollMs])

  // Reset completed toggle when switching tabs or filters
  useEffect(() => setShowAllCompleted(false), [primaryTab, status, round])
  // Reset stage filter when switching to Today tab (stage filter is hidden there)
  useEffect(() => { if (primaryTab === 'today') setRound('all') }, [primaryTab])

  const source   = primaryTab === 'today' ? today : all
  const filtered = useMemo(() => filter(source, status, round), [source, status, round])

  return (
    <div>
      {/* ── Primary tabs + refresh ── */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-bg-elevated">
          {([
            { id: 'today' as const, label: "Today's Matches", icon: <Calendar className="w-3.5 h-3.5" />, count: today.length, hasLive: today.some(m => m.status === 'in') },
            { id: 'all'   as const, label: 'All Matches',     icon: <Globe2   className="w-3.5 h-3.5" />, count: all.length,   hasLive: false },
          ]).map(({ id, label, icon, count, hasLive }) => (
            <button
              key={id}
              onClick={() => setPrimaryTab(id)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                primaryTab === id ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {icon}
              {label}
              <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-full', primaryTab === id ? 'bg-white/20 text-white' : 'bg-bg-overlay text-text-muted')}>
                {count}
              </span>
              {hasLive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-live-pulse border-2 border-bg-elevated" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {anyLive && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-live-pulse" />
              Auto-updating every 30s
            </span>
          )}
          <button
            onClick={() => refresh(true)}
            title="Refresh"
            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent-blue/30 transition-all duration-200"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <FilterStrip
        source={source}
        status={status}
        round={round}
        showStage={primaryTab === 'all'}
        onStatus={(s) => setStatus(s)}
        onRound={(r) => setRound(r)}
      />

      {/* ── Divider ── */}
      <div className="h-px bg-border mb-6" />

      {/* ── Match list ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${primaryTab}-${status}-${round}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <MatchList
            matches={filtered}
            status={status}
            showAllCompleted={showAllCompleted}
            onToggleCompleted={() => setShowAllCompleted(v => !v)}
            onMatchDetail={setSelectedMatchId}
          />
        </motion.div>
      </AnimatePresence>

      <MatchDetailDrawer
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  )
}
