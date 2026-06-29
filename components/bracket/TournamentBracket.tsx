'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BracketRoundColumn, BASE_PX } from './BracketRound'
import { BracketMatchBox } from './BracketMatch'
import { PredictionBanner } from './PredictionBanner'
import { PredictionHint } from './PredictionHint'
import { MatchDetailDrawer } from './MatchDetailDrawer'
import type { RouteState } from './BracketMatch'
import { TeamFlag } from '@/components/shared/TeamFlag'
import { matchesToBracketData } from '@/lib/transformers/bracket.transformer'
import { usePredictions } from '@/lib/hooks/usePredictions'
import type { PredictionSide } from '@/lib/hooks/usePredictions'
import type { Match } from '@/types/match'
import type { BracketRound, BracketMatch, BracketRoundId } from '@/types/bracket'
import type { Group } from '@/types/standings'
import { cn } from '@/lib/utils'
import { RefreshCw, X, Trophy, ChevronRight } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_H = 8 * BASE_PX   // 704 px

const GROUP_COLORS = [
  '#4ade80', '#60a5fa', '#fb923c', '#c084fc',
  '#f87171', '#facc15', '#2dd4bf', '#f472b6',
  '#818cf8', '#a3e635', '#fbbf24', '#22d3ee',
]

const MAIN_ROUNDS: BracketRoundId[] = ['r32', 'r16', 'qf', 'sf']

// ─── Route computation ────────────────────────────────────────────────────────

interface RouteResult {
  /** Match IDs where the selected team is physically present (played / playing) */
  activeMatchIds: Set<string>
  /** Match IDs on the team's projected path to the Final (includes active + future) */
  routeMatchIds: Set<string>
}

function computeRoute(teamId: string | null, data: ReturnType<typeof matchesToBracketData>): RouteResult {
  const empty = { activeMatchIds: new Set<string>(), routeMatchIds: new Set<string>() }
  if (!teamId) return empty

  const activeMatchIds = new Set<string>()
  const routeMatchIds  = new Set<string>()

  let foundRoundIdx = -1
  let foundSidePos  = -1
  let foundSide: 'left' | 'right' = 'left'

  // 1. Scan main rounds to find which round/position the team is in
  for (let ri = 0; ri < MAIN_ROUNDS.length; ri++) {
    const round = data.rounds.find(r => r.id === MAIN_ROUNDS[ri])
    if (!round) continue

    const half = Math.ceil(round.matches.length / 2)

    for (let i = 0; i < round.matches.length; i++) {
      const m = round.matches[i]
      const teamIsHere =
        m.home.team?.id === teamId || m.away.team?.id === teamId

      if (teamIsHere) {
        activeMatchIds.add(m.id)
        routeMatchIds.add(m.id)

        // Track the deepest (latest) round they appear in
        if (ri > foundRoundIdx) {
          foundRoundIdx = ri
          foundSide     = i < half ? 'left' : 'right'
          foundSidePos  = i < half ? i : i - half
        }
      }
    }
  }

  // 2. Check Final
  const finalRound = data.rounds.find(r => r.id === 'final')
  if (finalRound?.matches[0]) {
    const fm = finalRound.matches[0]
    if (fm.home.team?.id === teamId || fm.away.team?.id === teamId) {
      activeMatchIds.add(fm.id)
      routeMatchIds.add(fm.id)
      return { activeMatchIds, routeMatchIds }   // already in Final, nothing to project
    }
  }

  if (foundRoundIdx < 0) return { activeMatchIds, routeMatchIds }

  // 3. Check if the team was eliminated in their deepest found round
  const deepestRound = data.rounds.find(r => r.id === MAIN_ROUNDS[foundRoundIdx])
  const deepestMatch = deepestRound?.matches.find(
    m => m.home.team?.id === teamId || m.away.team?.id === teamId,
  )
  const isEliminated =
    deepestMatch?.status === 'post' &&
    ((deepestMatch.home.team?.id === teamId && !deepestMatch.home.winner) ||
     (deepestMatch.away.team?.id === teamId && !deepestMatch.away.winner))

  if (isEliminated) {
    // Also highlight 3rd place if they appear there
    const thirdRound = data.rounds.find(r => r.id === '3rd')
    if (thirdRound?.matches[0]) {
      const tm = thirdRound.matches[0]
      if (tm.home.team?.id === teamId || tm.away.team?.id === teamId) {
        activeMatchIds.add(tm.id)
        routeMatchIds.add(tm.id)
      }
    }
    return { activeMatchIds, routeMatchIds }
  }

  // 4. Project forward: trace bracket position through remaining rounds
  let pos = foundSidePos
  for (let ri = foundRoundIdx + 1; ri < MAIN_ROUNDS.length; ri++) {
    const round = data.rounds.find(r => r.id === MAIN_ROUNDS[ri])
    if (!round) continue

    pos = Math.floor(pos / 2)
    const half = Math.ceil(round.matches.length / 2)
    const idx  = foundSide === 'left' ? pos : half + pos

    if (idx < round.matches.length) {
      routeMatchIds.add(round.matches[idx].id)
    }
  }

  // 5. Always include the Final on the route for active teams
  if (finalRound?.matches[0]) {
    routeMatchIds.add(finalRound.matches[0].id)
  }

  return { activeMatchIds, routeMatchIds }
}

// ─── Group sidebar ────────────────────────────────────────────────────────────

function GroupBox({ group, color }: { group: Group; color: string }) {
  return (
    <div
      className="flex-1 flex flex-col min-h-0 rounded overflow-hidden"
      style={{ borderLeft: `2px solid ${color}`, background: `${color}0a` }}
    >
      <div
        className="text-[8px] font-black uppercase tracking-[0.2em] text-center py-[3px] shrink-0"
        style={{ color, background: `${color}18` }}
      >
        {group.abbreviation}
      </div>
      <div className="flex-1 grid grid-cols-2 gap-px p-[3px] min-h-0">
        {group.entries.slice(0, 4).map(e => (
          <div key={e.team.id} className="flex items-center justify-center py-px">
            <TeamFlag logoUrl={e.team.logoUrl} name={e.team.name} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupsColumn({ groups, colorOffset = 0 }: { groups: Group[]; colorOffset?: number }) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: 74 }}>
      <div className="h-9" />
      <div className="flex flex-col gap-[3px]" style={{ height: TOTAL_H }}>
        {groups.map((g, i) => (
          <GroupBox key={g.id} group={g} color={GROUP_COLORS[(colorOffset + i) % GROUP_COLORS.length]} />
        ))}
      </div>
    </div>
  )
}

// ─── Center column ────────────────────────────────────────────────────────────

interface CenterColProps {
  finalMatch: BracketMatch | undefined
  thirdMatch: BracketMatch | undefined
  selectedTeamId: string | null
  onSelectTeam: (id: string | null) => void
  routeMatchIds: Set<string>
  activeMatchIds: Set<string>
  predictions: Record<string, PredictionSide>
  onPredict: (matchId: string, side: PredictionSide) => void
  onMatchDetail: (matchId: string) => void
}

function CenterColumn({
  finalMatch, thirdMatch, selectedTeamId, onSelectTeam, routeMatchIds, activeMatchIds,
  predictions, onPredict, onMatchDetail,
}: CenterColProps) {
  const getState = (m: BracketMatch | undefined): RouteState => {
    if (!m) return 'normal'
    const hasSelection = !!selectedTeamId
    if (!hasSelection) return 'normal'
    if (activeMatchIds.has(m.id)) return 'active'
    if (routeMatchIds.has(m.id)) return 'route'
    return 'dim'
  }

  return (
    <div className="flex flex-col shrink-0 items-center" style={{ width: 184 }}>
      {/* Header row */}
      <div className="h-9 flex items-end justify-center pb-1">
        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-[#e8b84b]/40">Final</span>
      </div>

      <div className="flex flex-col items-center justify-center gap-5" style={{ height: TOTAL_H }}>

        {/* Trophy + FINAL label */}
        <div className="flex flex-col items-center gap-2.5">
          <Trophy
            className="w-9 h-9 text-[#e8b84b]/45"
            strokeWidth={1.25}
          />
          <span
            className="text-[28px] font-black tracking-[0.35em] uppercase leading-none"
            style={{
              background: 'linear-gradient(135deg, #e8b84b 0%, #f5d67a 50%, #c89b2a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FINAL
          </span>
        </div>

        {/* Final match card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {finalMatch ? (
            <BracketMatchBox
              match={finalMatch}
              routeState={getState(finalMatch)}
              selectedTeamId={selectedTeamId}
              onSelectTeam={onSelectTeam}
              wide
              prediction={predictions[finalMatch.id]}
              onPredict={(side) => onPredict(finalMatch.id, side)}
              onMatchDetail={() => onMatchDetail(finalMatch.id)}
            />
          ) : (
            <TbdCard wide />
          )}
        </motion.div>

        {/* 3rd place divider */}
        <div className="flex items-center gap-2 w-40">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[8px] font-mono tracking-[0.25em] uppercase text-white/28 whitespace-nowrap">
            3rd Place
          </span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Third place match card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          {thirdMatch ? (
            <BracketMatchBox
              match={thirdMatch}
              routeState={getState(thirdMatch)}
              selectedTeamId={selectedTeamId}
              onSelectTeam={onSelectTeam}
              wide
              prediction={predictions[thirdMatch.id]}
              onPredict={(side) => onPredict(thirdMatch.id, side)}
              onMatchDetail={() => onMatchDetail(thirdMatch.id)}
            />
          ) : (
            <TbdCard wide />
          )}
        </motion.div>
      </div>
    </div>
  )
}

function TbdCard({ wide }: { wide?: boolean }) {
  return (
    <div
      className="rounded-[6px] overflow-hidden border border-dashed border-white/8"
      style={{ width: wide ? 168 : 152, background: '#0d1929' }}
    >
      {[0, 1].map(i => (
        <div key={i} className={cn('flex items-center gap-2 px-2.5 py-[7px]', i === 0 && 'border-b border-white/6')}>
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/8" />
          <span className="text-[10px] text-white/20 italic">TBD</span>
        </div>
      ))}
    </div>
  )
}

// ─── Team banner ──────────────────────────────────────────────────────────────

interface BannerProps {
  team: { name: string; abbreviation: string; logoUrl: string } | null
  routeMatchIds: Set<string>
  data: ReturnType<typeof matchesToBracketData>
  onClear: () => void
}

function SelectedTeamBanner({ team, routeMatchIds, data, onClear }: BannerProps) {
  if (!team) return null

  // Build route round labels for display
  const routeRounds: string[] = []
  for (const round of data.rounds) {
    if (round.id === '3rd') continue
    if (round.matches.some(m => routeMatchIds.has(m.id))) {
      routeRounds.push(round.shortLabel)
    }
  }

  return (
    <motion.div
      key="banner"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-2.5 bg-[#4090ff]/8 border-b border-[#4090ff]/20">
        <TeamFlag logoUrl={team.logoUrl} name={team.name} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-bold text-white leading-none">{team.name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {routeRounds.map((label, i) => (
              <span key={label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-[#4090ff]/50" />}
                <span className="text-[9px] font-mono text-[#4090ff]/80 uppercase tracking-wide">{label}</span>
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onClear}
          className="ml-auto p-1 rounded-md hover:bg-white/8 text-white/40 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialMatches: Match[]
  groups?: Group[]
}

export function TournamentBracket({ initialMatches, groups = [] }: Props) {
  const [matches, setMatches]               = useState<Match[]>(initialMatches)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [refreshing, setRefreshing]         = useState(false)

  const { predictions, predict, getShareUrl, getStats, isSharedView } = usePredictions()
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const anyLive = useMemo(() => matches.some(m => m.status === 'in'), [matches])
  const pollMs  = anyLive ? 30_000 : 120_000

  const refresh = useCallback(async (indicator = false) => {
    if (indicator) setRefreshing(true)
    try {
      const data = await fetch('/api/schedule/all').then(r => r.json() as Promise<Match[]>)
      setMatches(data)
    } catch { /* silent */ }
    if (indicator) setRefreshing(false)
  }, [])

  useEffect(() => {
    const id = setInterval(() => refresh(), pollMs)
    return () => clearInterval(id)
  }, [refresh, pollMs])

  // Derive bracket structure
  const data = useMemo(() => {
    const knockout = matches.filter(m => {
      const slug = (m.round || '').toLowerCase()
      return !slug.includes('group')
    })
    return matchesToBracketData(knockout)
  }, [matches])

  // Route highlighting
  const { activeMatchIds, routeMatchIds } = useMemo(
    () => computeRoute(selectedTeamId, data),
    [selectedTeamId, data],
  )

  // Prediction stats
  const allBracketMatches = useMemo(() => data.rounds.flatMap(r => r.matches), [data])
  const predictionStats   = useMemo(() => getStats(allBracketMatches), [getStats, allBracketMatches])
  const hasPredictions    = Object.keys(predictions).length > 0

  const handlePredict = useCallback((matchId: string, side: PredictionSide) => {
    predict(matchId, side)
  }, [predict])

  const mainRounds = useMemo(
    () => data.rounds.filter(r => r.id !== 'final' && r.id !== '3rd'),
    [data],
  )
  const finalMatch = data.rounds.find(r => r.id === 'final')?.matches[0]
  const thirdMatch = data.rounds.find(r => r.id === '3rd')?.matches[0]

  // Left/right bracket
  function sliceFor(round: BracketRound) {
    const n    = round.matches.length
    const half = Math.ceil(n / 2)
    return { left: [0, half] as [number, number], right: [half, n] as [number, number] }
  }

  const leftRounds  = mainRounds
  const rightRounds = [...mainRounds].reverse()

  // Selected team metadata for banner
  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null
    for (const m of matches) {
      if (m.homeTeam?.id === selectedTeamId) return m.homeTeam
      if (m.awayTeam?.id === selectedTeamId) return m.awayTeam
    }
    return null
  }, [selectedTeamId, matches])

  const leftGroups  = groups.slice(0, 6)
  const rightGroups = groups.slice(6, 12)

  if (data.rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Trophy className="w-12 h-12 text-white/10" />
        <p className="text-white/40 text-sm">Knockout bracket not yet available.</p>
        <p className="text-white/25 text-xs">Check back when the group stage concludes.</p>
      </div>
    )
  }

  const GAP = 24   // px gap between columns (connectors extend 16px outside their column)

  return (
    <div className="relative">
      <MatchDetailDrawer
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 gap-3">
        <div className="flex items-center gap-4">
          {anyLive && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live · 30s updates
            </span>
          )}
          <span className="hidden sm:flex items-center gap-2 text-[11px] text-white/35">
            <span className="w-[5px] h-[5px] rounded-full bg-[#4090ff] shrink-0" />
            Click team to trace path · predict upcoming matches
          </span>
        </div>
        <button
          onClick={() => refresh(true)}
          className="p-1.5 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
        </button>
      </div>

      {/* Selected team banner */}
      <AnimatePresence>
        {selectedTeam && (
          <SelectedTeamBanner
            team={selectedTeam}
            routeMatchIds={routeMatchIds}
            data={data}
            onClear={() => setSelectedTeamId(null)}
          />
        )}
      </AnimatePresence>

      {/* One-time onboarding hint */}
      <PredictionHint hasPredictions={hasPredictions} />

      {/* Prediction banner */}
      <AnimatePresence>
        {hasPredictions && (
          <PredictionBanner
            stats={predictionStats}
            isSharedView={isSharedView}
            onShare={getShareUrl}
            hasPredictions={hasPredictions}
          />
        )}
      </AnimatePresence>

      {/* Bracket */}
      <div className="overflow-x-auto pb-8 pt-5">
        <div className="flex items-start min-w-max px-5" style={{ gap: GAP }}>

          {/* Groups A–F */}
          {leftGroups.length > 0 && (
            <GroupsColumn groups={leftGroups} colorOffset={0} />
          )}

          {/* LEFT: R32 → R16 → QF → SF */}
          {leftRounds.map((round, idx) => (
            <BracketRoundColumn
              key={`L-${round.id}`}
              round={round}
              roundIndex={idx}
              side="left"
              matchSlice={sliceFor(round).left}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
              routeMatchIds={routeMatchIds}
              activeMatchIds={activeMatchIds}
              label={idx === leftRounds.length - 1 ? 'Semi-Final 1' : undefined}
              predictions={predictions}
              onPredict={handlePredict}
              onMatchDetail={setSelectedMatchId}
            />
          ))}

          {/* CENTER: Final + 3rd */}
          <CenterColumn
            finalMatch={finalMatch}
            thirdMatch={thirdMatch}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
            routeMatchIds={routeMatchIds}
            activeMatchIds={activeMatchIds}
            predictions={predictions}
            onPredict={handlePredict}
            onMatchDetail={setSelectedMatchId}
          />

          {/* RIGHT: SF → QF → R16 → R32 (mirrored) */}
          {rightRounds.map((round, idx) => (
            <BracketRoundColumn
              key={`R-${round.id}`}
              round={round}
              roundIndex={idx}
              side="right"
              matchSlice={sliceFor(round).right}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
              routeMatchIds={routeMatchIds}
              activeMatchIds={activeMatchIds}
              label={idx === 0 ? 'Semi-Final 2' : undefined}
              predictions={predictions}
              onPredict={handlePredict}
              onMatchDetail={setSelectedMatchId}
            />
          ))}

          {/* Groups G–L */}
          {rightGroups.length > 0 && (
            <GroupsColumn groups={rightGroups} colorOffset={6} />
          )}

        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-6 pb-5 text-[10px] font-mono text-white/30 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#e8b84b]" />
          Winner
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4090ff]" />
          Team path
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Live
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-400 text-[10px] leading-none">★</span>
          Your prediction
        </span>
      </div>
    </div>
  )
}
