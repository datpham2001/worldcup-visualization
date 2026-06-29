'use client'

import { motion } from 'framer-motion'
import { BracketMatchBox } from './BracketMatch'
import type { BracketRound as BracketRoundType } from '@/types/bracket'
import type { RouteState } from './BracketMatch'
import type { PredictionSide } from '@/lib/hooks/usePredictions'

// Each R32 slot = BASE_PX. Multiplier per round doubles toward center.
export const BASE_PX = 88
export const SLOT_MULT: Record<string, number> = {
  r32: 1, r16: 2, qf: 4, sf: 8, '3rd': 1, final: 16,
}

export interface BracketRoundColumnProps {
  round: BracketRoundType
  roundIndex: number
  side: 'left' | 'right'
  selectedTeamId: string | null
  onSelectTeam: (id: string | null) => void
  matchSlice?: [number, number]
  routeMatchIds: Set<string>
  activeMatchIds: Set<string>
  label?: string
  predictions?: Record<string, PredictionSide>
  onPredict?: (matchId: string, side: PredictionSide) => void
  onMatchDetail?: (matchId: string) => void
}

export function BracketRoundColumn({
  round, roundIndex, side, selectedTeamId, onSelectTeam,
  matchSlice, routeMatchIds, activeMatchIds, label,
  predictions, onPredict, onMatchDetail,
}: BracketRoundColumnProps) {
  const matches = matchSlice ? round.matches.slice(matchSlice[0], matchSlice[1]) : round.matches
  const mult    = SLOT_MULT[round.id] ?? 1
  const slotH   = mult * BASE_PX
  const CARD_W  = 152

  // No connector from innermost (SF) — it connects to center Final specially
  const showConnector = !label
  const CONN_PX = 16

  return (
    <div className="flex flex-col shrink-0" style={{ width: CARD_W + 16 }}>
      {/* Column header */}
      <div className="h-9 flex items-end justify-center pb-1.5">
        {label ? (
          <span className="text-[10px] font-black tracking-[0.22em] uppercase text-[#e8b84b] leading-none">
            {label}
          </span>
        ) : (
          <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-white/20 leading-none">
            {round.shortLabel}
          </span>
        )}
      </div>

      {/* Match slots */}
      <div className="flex flex-col relative overflow-visible">
        {matches.map((match, i) => {
          const isPairTop  = i % 2 === 0
          const isOnRoute  = routeMatchIds.has(match.id)
          const isActive   = activeMatchIds.has(match.id)
          const hasAnySelected = selectedTeamId !== null

          const routeState: RouteState = !hasAnySelected
            ? 'normal'
            : isActive
            ? 'active'
            : isOnRoute
            ? 'route'
            : 'dim'

          // Connector color: blue if this match is on the route, else ghost
          const connColor = isOnRoute
            ? 'rgba(64, 144, 255, 0.55)'
            : 'rgba(255, 255, 255, 0.07)'

          const connStyle = showConnector
            ? (side === 'left'
              ? {
                  position: 'absolute' as const,
                  right: -CONN_PX,
                  width: CONN_PX,
                  top: isPairTop ? '50%' : 0,
                  height: '50%',
                  borderRight: `1.5px solid ${connColor}`,
                  ...(isPairTop
                    ? { borderBottom: `1.5px solid ${connColor}` }
                    : { borderTop:    `1.5px solid ${connColor}` }),
                }
              : {
                  position: 'absolute' as const,
                  left: -CONN_PX,
                  width: CONN_PX,
                  top: isPairTop ? '50%' : 0,
                  height: '50%',
                  borderLeft: `1.5px solid ${connColor}`,
                  ...(isPairTop
                    ? { borderBottom: `1.5px solid ${connColor}` }
                    : { borderTop:    `1.5px solid ${connColor}` }),
                })
            : null

          return (
            <div
              key={match.id}
              className="relative flex items-center justify-center overflow-visible"
              style={{ height: slotH }}
            >
              {connStyle && <div style={connStyle} />}

              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: roundIndex * 0.07 + i * 0.03, duration: 0.24, ease: 'easeOut' }}
              >
                <BracketMatchBox
                  match={match}
                  routeState={routeState}
                  selectedTeamId={selectedTeamId}
                  onSelectTeam={onSelectTeam}
                  prediction={predictions?.[match.id]}
                  onPredict={onPredict ? (side) => onPredict(match.id, side) : undefined}
                  onMatchDetail={onMatchDetail ? () => onMatchDetail(match.id) : undefined}
                />
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
