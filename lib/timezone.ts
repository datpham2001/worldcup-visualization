export interface TimezoneOption {
  tz: string
  abbr: string
  label: string
  offset: string
}

export const TIMEZONES: TimezoneOption[] = [
  { tz: 'UTC',                              abbr: 'UTC',  label: 'UTC',                    offset: 'UTC+0'    },
  { tz: 'America/Los_Angeles',              abbr: 'PT',   label: 'Los Angeles / Vancouver', offset: 'UTC-7/8'  },
  { tz: 'America/Denver',                   abbr: 'MT',   label: 'Denver / Calgary',        offset: 'UTC-6/7'  },
  { tz: 'America/Chicago',                  abbr: 'CT',   label: 'Chicago / Mexico City',   offset: 'UTC-5/6'  },
  { tz: 'America/New_York',                 abbr: 'ET',   label: 'New York / Toronto',      offset: 'UTC-4/5'  },
  { tz: 'America/Sao_Paulo',               abbr: 'BRT',  label: 'São Paulo / Brasília',    offset: 'UTC-3'    },
  { tz: 'America/Argentina/Buenos_Aires',   abbr: 'ART',  label: 'Buenos Aires',            offset: 'UTC-3'    },
  { tz: 'Europe/London',                    abbr: 'GMT',  label: 'London',                  offset: 'UTC+0/1'  },
  { tz: 'Europe/Paris',                     abbr: 'CET',  label: 'Paris / Berlin / Madrid', offset: 'UTC+1/2'  },
  { tz: 'Europe/Moscow',                    abbr: 'MSK',  label: 'Moscow',                  offset: 'UTC+3'    },
  { tz: 'Africa/Casablanca',                abbr: 'WET',  label: 'Casablanca / Morocco',    offset: 'UTC+1'    },
  { tz: 'Asia/Riyadh',                      abbr: 'AST',  label: 'Saudi Arabia / Kuwait',   offset: 'UTC+3'    },
  { tz: 'Asia/Dubai',                       abbr: 'GST',  label: 'Dubai / UAE',             offset: 'UTC+4'    },
  { tz: 'Asia/Kolkata',                     abbr: 'IST',  label: 'India',                   offset: 'UTC+5:30' },
  { tz: 'Asia/Bangkok',                     abbr: 'ICT',  label: 'Vietnam / Thailand',      offset: 'UTC+7'    },
  { tz: 'Asia/Singapore',                   abbr: 'SGT',  label: 'Singapore / Malaysia',    offset: 'UTC+8'    },
  { tz: 'Asia/Shanghai',                    abbr: 'CST',  label: 'China',                   offset: 'UTC+8'    },
  { tz: 'Asia/Seoul',                       abbr: 'KST',  label: 'Korea / Japan',           offset: 'UTC+9'    },
  { tz: 'Australia/Sydney',                 abbr: 'AEST', label: 'Sydney / Melbourne',      offset: 'UTC+10'   },
]

export const DEFAULT_TZ = TIMEZONES.find(t => t.tz === 'Asia/Bangkok')!

export function fmtTime(dateStr: string, tz: string, abbr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz,
  }) + ` ${abbr}`
}

export function fmtDate(dateStr: string, tz: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: tz,
  })
}

export function fmtDateKey(dateStr: string, tz: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: tz })
}

export function fmtDateLong(dateStr: string, tz: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: tz,
  })
}

export function fmtDateLabel(key: string, tz: string): string {
  const now = new Date()
  const tok = now.toLocaleDateString('en-CA', { timeZone: tz })
  const tmk = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const ysk = new Date(now.getTime() - 86400000).toLocaleDateString('en-CA', { timeZone: tz })
  const fmt = new Date(key + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
  if (key === tok) return `Today · ${fmt}`
  if (key === tmk) return `Tomorrow · ${fmt}`
  if (key === ysk) return `Yesterday · ${fmt}`
  return fmt
}
