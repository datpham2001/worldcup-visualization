'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PredictionStats } from '@/lib/hooks/usePredictions'

interface Props {
  stats: PredictionStats
  isSharedView: boolean
  onShare: () => string
  hasPredictions: boolean
}

export function PredictionBanner({ stats, isSharedView, onShare, hasPredictions }: Props) {
  const [copied, setCopied] = useState(false)

  if (!hasPredictions) return null

  const handleShare = async () => {
    const url = onShare()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback: select text via prompt
      window.prompt('Copy this link:', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0f1e35] border-b border-white/6 text-sm">
        <span className="text-base shrink-0">🎯</span>

        {isSharedView ? (
          <span className="text-white/40 flex-1 text-[12px]">
            Viewing shared bracket predictions
          </span>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 text-[12px] flex-wrap">
              <span className="font-semibold text-green-400">{stats.correct} ✅</span>
              <span className="text-white/25">·</span>
              <span className="font-semibold text-red-400/70">{stats.wrong} ❌</span>
              <span className="text-white/25">·</span>
              <span className="text-white/35">{stats.pending} pending</span>
            </div>

            <button
              onClick={handleShare}
              className="shrink-0 text-[11px] font-mono text-white/40 hover:text-white/80 border border-white/10 hover:border-white/25 rounded-lg px-3 py-1 transition-all duration-150 whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Share ↗'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}
