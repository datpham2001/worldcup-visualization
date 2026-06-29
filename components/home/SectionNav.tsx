'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, BarChart2, Star, GitBranch } from 'lucide-react'

interface NavCard {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  accent: string
  glowColor: string
  stat?: string
  statLabel?: string
}

const cards: NavCard[] = [
  {
    href: '/schedule',
    icon: <Calendar className="w-6 h-6" />,
    label: 'Schedule',
    description: 'All 104 fixtures, live scores, group results',
    accent: 'from-blue-500/20 to-transparent',
    glowColor: 'rgba(59,130,246,0.3)',
    stat: '6',
    statLabel: 'TODAY',
  },
  {
    href: '/standings',
    icon: <BarChart2 className="w-6 h-6" />,
    label: 'Standings',
    description: 'Groups A–L, qualification race, goal difference',
    accent: 'from-emerald-500/20 to-transparent',
    glowColor: 'rgba(34,197,94,0.3)',
    stat: '12',
    statLabel: 'GROUPS',
  },
  {
    href: '/scorers',
    icon: <Star className="w-6 h-6" />,
    label: 'Top Scorers',
    description: 'Goals, assists, penalties — live leaderboard',
    accent: 'from-amber-500/20 to-transparent',
    glowColor: 'rgba(232,184,75,0.3)',
    stat: '48',
    statLabel: 'NATIONS',
  },
  {
    href: '/bracket',
    icon: <GitBranch className="w-6 h-6" />,
    label: 'Bracket',
    description: 'R32 through Final — the full knockout tree',
    accent: 'from-purple-500/20 to-transparent',
    glowColor: 'rgba(168,85,247,0.3)',
    stat: 'R32',
    statLabel: 'STAGE',
  },
]

export function SectionNav() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.href}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={card.href} className="group block h-full">
            <div
              className="relative h-full bg-bg-surface border border-border rounded-2xl p-5 overflow-hidden transition-all duration-300 group-hover:border-white/20"
              style={{
                '--glow': card.glowColor,
              } as React.CSSProperties}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${card.glowColor} 0%, transparent 60%)`,
                }}
              />

              {/* Gradient accent strip */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${card.accent.replace('to-transparent', 'via-current to-transparent')}`}
                style={{ opacity: 0.6 }}
              />

              <div className="relative">
                {/* Icon + stat */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-white/50 group-hover:text-white/80 transition-colors">
                    {card.icon}
                  </div>
                  {card.stat && (
                    <div className="text-right">
                      <p className="font-display text-xl text-white/70 leading-none group-hover:text-white transition-colors">
                        {card.stat}
                      </p>
                      <p className="text-[9px] font-mono text-white/30 tracking-widest">{card.statLabel}</p>
                    </div>
                  )}
                </div>

                {/* Label */}
                <h3 className="font-display text-2xl text-white tracking-wide mb-1 group-hover:text-accent-gold transition-colors duration-200">
                  {card.label}
                </h3>

                {/* Description */}
                <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  {card.description}
                </p>

                {/* Arrow */}
                <div className="mt-4 flex items-center gap-1 text-xs font-mono text-white/30 group-hover:text-accent-blue group-hover:gap-2 transition-all duration-200">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
