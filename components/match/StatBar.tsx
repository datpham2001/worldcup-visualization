'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface StatBarProps {
  name: string
  homeValue: number
  awayValue: number
  homeDisplay: string
  awayDisplay: string
}

export function StatBar({ name, homeValue, awayValue, homeDisplay, awayDisplay }: StatBarProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const total = homeValue + awayValue
  const homePercent = total === 0 ? 50 : (homeValue / total) * 100
  const awayPercent = total === 0 ? 50 : (awayValue / total) * 100

  const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()

  return (
    <div ref={ref} className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-mono font-semibold text-text-primary">{homeDisplay}</span>
        <span className="text-xs text-text-muted">{displayName}</span>
        <span className="text-sm font-mono font-semibold text-text-primary">{awayDisplay}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-bg-elevated">
        <motion.div
          className="bg-accent-blue rounded-l-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${homePercent}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="bg-accent-red rounded-r-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${awayPercent}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}
