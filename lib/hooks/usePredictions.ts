'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BracketMatch } from '@/types/bracket'

export type PredictionSide = 'home' | 'away'
export type PredictionMap  = Record<string, PredictionSide>

const STORAGE_KEY = 'wc2026_predictions'

export interface PredictionStats {
  correct: number
  wrong: number
  pending: number
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<PredictionMap>({})
  const [isSharedView, setIsSharedView] = useState(false)

  useEffect(() => {
    // 1. Check URL for shared predictions (?p=<base64>)
    const urlParams = new URLSearchParams(window.location.search)
    const shared = urlParams.get('p')
    if (shared) {
      try {
        const decoded = JSON.parse(atob(shared))
        // Validate: must be a plain object with only 'home'|'away' string values
        if (
          decoded &&
          typeof decoded === 'object' &&
          !Array.isArray(decoded) &&
          Object.values(decoded).every(v => v === 'home' || v === 'away')
        ) {
          setPredictions(decoded as PredictionMap)
          setIsSharedView(true)
          return
        }
      } catch { /* malformed — fall through to localStorage */ }
    }
    // 2. Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          parsed && typeof parsed === 'object' && !Array.isArray(parsed) &&
          Object.values(parsed).every(v => v === 'home' || v === 'away')
        ) {
          setPredictions(parsed as PredictionMap)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const predict = useCallback((matchId: string, side: PredictionSide) => {
    if (isSharedView) return
    setPredictions(prev => {
      // toggle off if same prediction clicked
      const next = prev[matchId] === side
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== matchId))
        : { ...prev, [matchId]: side }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [isSharedView])

  const getShareUrl = useCallback((): string => {
    const encoded = btoa(JSON.stringify(predictions))
    const url = new URL(window.location.href)
    url.searchParams.set('p', encoded)
    url.searchParams.delete('p')  // remove first so we replace cleanly
    url.searchParams.set('p', encoded)
    return url.toString()
  }, [predictions])

  const getStats = useCallback((bracketMatches: BracketMatch[]): PredictionStats => {
    let correct = 0, wrong = 0, pending = 0
    for (const [matchId, side] of Object.entries(predictions)) {
      const match = bracketMatches.find(m => m.id === matchId)
      if (!match || match.status !== 'post') {
        pending++
        continue
      }
      const predictedWon = side === 'home' ? match.home.winner : match.away.winner
      predictedWon ? correct++ : wrong++
    }
    return { correct, wrong, pending }
  }, [predictions])

  return { predictions, predict, getShareUrl, getStats, isSharedView }
}
