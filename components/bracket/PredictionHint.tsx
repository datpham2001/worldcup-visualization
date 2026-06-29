'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const HINT_KEY    = 'wc2026_hint_seen'
const AUTO_CLOSE  = 5000   // ms

interface Props {
  hasPredictions: boolean
}

export function PredictionHint({ hasPredictions }: Props) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Only show once, and only before the user has made any predictions
    if (hasPredictions) return
    try {
      if (localStorage.getItem(HINT_KEY)) return
    } catch { /* ignore */ }
    // Small delay so the bracket renders first
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [hasPredictions])

  // Auto-dismiss
  useEffect(() => {
    if (!visible) return
    timerRef.current = setTimeout(() => dismiss(), AUTO_CLOSE)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible])

  // Hide when user makes first prediction
  useEffect(() => {
    if (hasPredictions && visible) dismiss()
  }, [hasPredictions, visible])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(HINT_KEY, '1') } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="relative mx-5 my-3 flex items-center gap-3 px-4 py-3 bg-amber-400/8 border border-amber-400/25 rounded-xl">
            {/* Pulse dot */}
            <span className="relative flex shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute inset-0 opacity-60" />
              <span className="w-2 h-2 rounded-full bg-amber-400 relative" />
            </span>

            <p className="flex-1 text-[12px] text-amber-200/80 leading-snug">
              <span className="font-semibold text-amber-300">Predict the winner</span>
              {' — click any team in an upcoming match to make your prediction, then share your bracket with friends.'}
            </p>

            <button
              onClick={dismiss}
              className="shrink-0 p-1 rounded-md text-amber-400/50 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Auto-close progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-amber-400/40 rounded-bl-xl rounded-br-xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: AUTO_CLOSE / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
