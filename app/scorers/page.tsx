'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageContainer } from '@/components/shared/PageContainer'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { LeaderboardTable } from '@/components/scorers/LeaderboardTable'
import { ErrorState } from '@/components/shared/ErrorState'
import type { Scorer, TeamStat } from '@/types/scorers'
import { cn } from '@/lib/utils'

type Tab = 'goals' | 'assists' | 'teams'

interface ScorersData {
  goals: Scorer[]
  assists: Scorer[]
  teams: TeamStat[]
}

const TABS: { id: Tab; label: string; sub: string; emoji: string }[] = [
  { id: 'goals',   label: 'Top Scorers', sub: 'Most goals',    emoji: '⚽' },
  { id: 'assists', label: 'Top Assists', sub: 'Most assists',  emoji: '🎯' },
  { id: 'teams',   label: 'Team Goals',  sub: 'By country',   emoji: '🏆' },
]

// Progressively loads photos from TheSportsDB for a list of players
function useProgressivePhotos(scorers: Scorer[]): Record<string, string | null> {
  const [photos, setPhotos] = useState<Record<string, string | null>>({})
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scorers.length === 0) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    let cancelled = false

    async function loadSequentially() {
      for (const scorer of scorers) {
        if (cancelled) break
        // Skip if ESPN headshot is already a real URL
        if (scorer.athlete.photoUrl) continue

        try {
          const params = new URLSearchParams({
            id:   scorer.athlete.id,
            name: scorer.athlete.displayName,
          })
          const res = await fetch(`/api/player-photo?${params}`, { signal: ctrl.signal })
          if (res.ok) {
            const { url } = await res.json() as { url: string | null }
            if (url) {
              setPhotos(prev => ({ ...prev, [scorer.athlete.id]: url }))
            }
          }
        } catch {
          // aborted or network error — stop
          break
        }
        // small gap to avoid hammering TheSportsDB
        await new Promise(r => setTimeout(r, 120))
      }
    }

    loadSequentially()
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [scorers])

  return photos
}

function TabButton({ t, active, onClick }: {
  t: typeof TABS[0]
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 min-w-[110px]',
        active
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary',
      )}
    >
      {active && (
        <motion.div
          layoutId="tab-bg"
          className="absolute inset-0 bg-bg-surface rounded-lg shadow-sm border border-border/50"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative text-base leading-none">{t.emoji}</span>
      <span className="relative flex flex-col items-start">
        <span className={cn('text-sm font-semibold leading-tight', active && 'text-text-primary')}>
          {t.label}
        </span>
        <span className="text-[11px] text-text-muted leading-none mt-0.5">{t.sub}</span>
      </span>
    </button>
  )
}

export default function ScorersPage() {
  const [tab, setTab]         = useState<Tab>('goals')
  const [data, setData]       = useState<ScorersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const res = await fetch('/api/scorers')
      if (!res.ok) throw new Error('fetch failed')
      const d = await res.json() as ScorersData
      setData(d)
      setError(false)
    } catch {
      setError(true)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [])

  useEffect(() => { loadData(true) }, [loadData])
  useEffect(() => {
    const id = setInterval(() => loadData(false), 120_000)
    return () => clearInterval(id)
  }, [loadData])

  // Progressive photo enhancement for current player tab
  const goalsPhotos   = useProgressivePhotos(data?.goals   ?? [])
  const assistsPhotos = useProgressivePhotos(data?.assists ?? [])
  const activePhotos  = tab === 'goals' ? goalsPhotos : assistsPhotos

  const activeScorers = tab === 'goals' ? (data?.goals ?? []) : (data?.assists ?? [])

  return (
    <PageContainer>
      <SectionHeading
        title="Goals & Leaders"
        subtitle="Top scorers, assists, and team goal tallies · updated continuously"
      />

      {/* Tab switcher */}
      <div className="flex bg-bg-elevated border border-border rounded-xl p-1 w-fit mb-6 gap-0.5">
        {TABS.map(t => (
          <TabButton
            key={t.id}
            t={t}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>

      {/* Content with tab transition */}
      {loading ? (
        <Skeleton />
      ) : error || !data ? (
        <ErrorState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {tab === 'teams' ? (
              <LeaderboardTable mode="teams" teams={data.teams} />
            ) : (
              <LeaderboardTable
                mode="players"
                scorers={activeScorers}
                highlightStat={tab}
                enhancedPhotos={activePhotos}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </PageContainer>
  )
}

function Skeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="h-[60px] bg-bg-surface border border-border rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.07 }}
        />
      ))}
    </div>
  )
}
