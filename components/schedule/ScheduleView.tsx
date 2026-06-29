'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MatchCard } from './MatchCard'
import { MatchDetailDrawer } from '@/components/bracket/MatchDetailDrawer'
import { TeamFlag } from '@/components/shared/TeamFlag'
import type { Match } from '@/types/match'
import type { Team } from '@/types/team'
import { cn } from '@/lib/utils'
import { RefreshCw, Calendar, Globe2, ChevronDown, ChevronUp, Search, X, Users } from 'lucide-react'

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
function byTeam(matches: Match[], teamId: string | null): Match[] {
  if (!teamId) return matches
  return matches.filter(m => m.homeTeam?.id === teamId || m.awayTeam?.id === teamId)
}
function filter(matches: Match[], s: StatusFilter, r: RoundFilter, teamId: string | null): Match[] {
  return byTeam(byRound(byStatus(matches, s), r), teamId)
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

// ─── Team picker (combobox) ───────────────────────────────────────────────────
interface TeamPickerProps {
  teams: Team[]
  selectedId: string | null
  onChange: (id: string | null) => void
}

function TeamPicker({ teams, selectedId, onChange }: TeamPickerProps) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef          = useRef<HTMLInputElement>(null)
  const containerRef      = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => teams.find(t => t.id === selectedId) ?? null, [teams, selectedId])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return teams
    return teams.filter(
      t => t.name.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q) || t.shortName?.toLowerCase().includes(q)
    )
  }, [teams, query])

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

  const pick = (id: string) => {
    onChange(id === selectedId ? null : id)
    setOpen(false)
    setQuery('')
  }

  const openPicker = () => {
    setQuery('')
    setOpen(true)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Trigger */}
      {selected ? (
        <div
          className="flex items-center gap-0 h-[34px] rounded-full border overflow-hidden"
          style={{ background: 'rgba(96,144,255,0.12)', border: '1px solid rgba(96,144,255,0.45)' }}
        >
          <button
            onClick={openPicker}
            className="flex items-center gap-2 h-full pl-2 pr-2.5 text-[12px] font-semibold transition-colors"
            style={{ color: '#90b8ff' }}
          >
            <TeamFlag logoUrl={selected.logoUrl} name={selected.name} size="sm" />
            <span>{selected.name}</span>
          </button>
          <button
            onClick={() => onChange(null)}
            className="flex items-center justify-center h-full px-2 border-l transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(96,144,255,0.3)', color: 'rgba(144,184,255,0.6)' }}
            aria-label="Clear team filter"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={openPicker}
          className={cn(
            'flex items-center gap-1.5 h-[34px] px-3 rounded-full text-[12px] font-semibold border transition-all duration-200',
            open
              ? 'bg-bg-elevated border-accent-blue/40 text-text-primary'
              : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-white/20',
          )}
        >
          <Users className="w-3.5 h-3.5 opacity-60" />
          Team
          <ChevronDown className={cn('w-3 h-3 opacity-50 transition-transform duration-150', open && 'rotate-180')} />
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[calc(100%+6px)] left-0 z-50 w-[260px] rounded-xl border border-border overflow-hidden shadow-2xl"
            style={{ background: '#0d1929' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
              <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type team name…"
                className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Team list */}
            <div className="overflow-y-auto max-h-[280px] py-1 scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-text-muted text-[12px]">No teams found</div>
              ) : filtered.map(team => (
                <button
                  key={team.id}
                  onClick={() => pick(team.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100',
                    team.id === selectedId
                      ? 'bg-accent-blue/15'
                      : 'hover:bg-white/5',
                  )}
                >
                  <TeamFlag logoUrl={team.logoUrl} name={team.name} size="sm" />
                  <span className={cn(
                    'flex-1 text-[12px] font-medium truncate',
                    team.id === selectedId ? 'text-accent-blue' : 'text-text-primary',
                  )}>
                    {team.name}
                  </span>
                  <span className={cn(
                    'text-[10px] font-mono shrink-0',
                    team.id === selectedId ? 'text-accent-blue/70' : 'text-text-muted',
                  )}>
                    {team.abbreviation}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
                <DateSection label={vnLabel(latestKey)} matches={latest} onMatchDetail={onMatchDetail} />
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
  allTeams: Team[]
  status: StatusFilter
  round: RoundFilter
  teamId: string | null
  showStage: boolean
  onStatus: (s: StatusFilter) => void
  onRound: (r: RoundFilter) => void
  onTeam: (id: string | null) => void
}

function FilterStrip({ source, allTeams, status, round, teamId, showStage, onStatus, onRound, onTeam }: FilterStripProps) {
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
      {/* Row 1: status chips — full width, no sibling stealing space */}
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

      {/* Row 2: team picker on the LEFT (always visible) + round chips scroll to the right */}
      {/* TeamPicker must be BEFORE any overflow-x-auto sibling so it's never cut off */}
      <div className="flex items-center gap-2">
        <TeamPicker teams={allTeams} selectedId={teamId} onChange={onTeam} />
        {showStage && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1 min-w-0">
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
  const [teamId,     setTeamId]           = useState<string | null>(null)
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
  useEffect(() => setShowAllCompleted(false), [primaryTab, status, round, teamId])
  // Reset stage filter when switching to Today tab (stage filter is hidden there)
  useEffect(() => { if (primaryTab === 'today') setRound('all') }, [primaryTab])

  // All unique teams sorted alphabetically (from the full 'all' list for completeness)
  const allTeams = useMemo<Team[]>(() => {
    const map = new Map<string, Team>()
    for (const m of all) {
      if (m.homeTeam?.id) map.set(m.homeTeam.id, m.homeTeam)
      if (m.awayTeam?.id) map.set(m.awayTeam.id, m.awayTeam)
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [all])

  const source   = primaryTab === 'today' ? today : all
  const filtered = useMemo(() => filter(source, status, round, teamId), [source, status, round, teamId])

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
        allTeams={allTeams}
        status={status}
        round={round}
        teamId={teamId}
        showStage={primaryTab === 'all'}
        onStatus={(s) => setStatus(s)}
        onRound={(r) => setRound(r)}
        onTeam={setTeamId}
      />

      {/* ── Divider ── */}
      <div className="h-px bg-border mb-6" />

      {/* ── Match list ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${primaryTab}-${status}-${round}-${teamId ?? ''}`}
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
