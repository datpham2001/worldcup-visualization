'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TIMEZONES, DEFAULT_TZ, type TimezoneOption } from '@/lib/timezone'

interface TzCtx {
  timezone: TimezoneOption
  setTimezone: (tz: TimezoneOption) => void
}

const TimezoneContext = createContext<TzCtx>({ timezone: DEFAULT_TZ, setTimezone: () => {} })

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = useState<TimezoneOption>(DEFAULT_TZ)

  useEffect(() => {
    const saved = localStorage.getItem('wc2026_tz')
    if (saved) {
      const found = TIMEZONES.find(t => t.tz === saved)
      if (found) setTimezoneState(found)
    }
  }, [])

  const setTimezone = useCallback((tz: TimezoneOption) => {
    setTimezoneState(tz)
    localStorage.setItem('wc2026_tz', tz.tz)
  }, [])

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  return useContext(TimezoneContext)
}
