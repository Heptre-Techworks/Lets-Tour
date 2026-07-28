// Pure, UTC-only date logic for the recurring-departure generator.
//
// Why UTC throughout: Vercel/Lambda run in UTC, and the admin CalendarView buckets a
// departure onto a day via `iso.slice(0, 10)`. If we built dates in local time
// (`new Date(y, m, d)`) the ISO date-substring could shift for east-of-UTC servers
// (e.g. IST) and land the departure on the wrong calendar cell. Stepping whole UTC days
// avoids DST drift, and emitting at noon UTC keeps `toISOString().slice(0,10)` — and the
// server-side `toLocaleDateString` title — on the intended calendar day everywhere.

export const MS_DAY = 86_400_000
const MS_WEEK = 7 * MS_DAY

/** The day-key a departure is bucketed under (matches CalendarView / dedupe). */
export const dayKeyOf = (iso: string | null | undefined): string | null =>
  iso ? iso.slice(0, 10) : null

/** Millisecond anchor at UTC midnight for the given date. */
export const utcMidnight = (input: string | Date): number => {
  const d = new Date(input)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Parse "HH:mm" → { h, m }, clamped to a valid time; defaults to noon. */
const parseTime = (hhmm?: string | null): { h: number; m: number } => {
  if (!hhmm) return { h: 12, m: 0 }
  const [hRaw, mRaw] = hhmm.split(':')
  const h = Math.min(23, Math.max(0, Number(hRaw) || 0))
  const m = Math.min(59, Math.max(0, Number(mRaw) || 0))
  return { h, m }
}

export type GenerateOptions = {
  startDate: string | Date
  untilDate: string | Date
  daysOfWeek: number[] // 0=Sun … 6=Sat (UTC weekday)
  intervalWeeks?: number // 1=weekly (default), 2=every other week …
  blackout?: string[] // day-keys (YYYY-MM-DD) to skip
  timeHHMM?: string | null // custom time of day, applied as UTC hours/minutes
  cap: number // hard limit on how many dates to emit
}

/**
 * All dates in [startDate, untilDate] whose UTC weekday ∈ daysOfWeek, honoring
 * `intervalWeeks` (counted from the start date's week = week 0) and skipping `blackout`
 * day-keys. Each date is emitted at `timeHHMM` (UTC) or noon UTC. Stops at `cap`.
 */
export function generateDepartureDates(opts: GenerateOptions): { dates: Date[]; truncated: boolean } {
  const days = new Set(opts.daysOfWeek)
  const blackout = new Set(opts.blackout ?? [])
  const start = utcMidnight(opts.startDate)
  const until = utcMidnight(opts.untilDate)
  const interval = Math.max(1, Math.floor(opts.intervalWeeks || 1))
  const { h, m } = parseTime(opts.timeHHMM)

  const dates: Date[] = []
  let truncated = false

  if (Number.isNaN(start) || Number.isNaN(until) || until < start || days.size === 0) {
    return { dates, truncated }
  }

  for (let t = start; t <= until; t += MS_DAY) {
    const d = new Date(t)
    if (!days.has(d.getUTCDay())) continue
    if (interval > 1 && Math.floor((t - start) / MS_WEEK) % interval !== 0) continue
    const key = new Date(t).toISOString().slice(0, 10)
    if (blackout.has(key)) continue
    dates.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m)))
    if (dates.length >= opts.cap) {
      truncated = true
      break
    }
  }

  return { dates, truncated }
}

/** endDate = departure + N nights, preserving the time-of-day. */
export const addNights = (base: Date, nights: number): string =>
  new Date(base.getTime() + nights * MS_DAY).toISOString()

/** Inclusive ISO range bounds for querying existing departures by startDate. */
export const rangeStartISO = (d: string | Date): string => new Date(utcMidnight(d)).toISOString()
export const rangeEndISO = (d: string | Date): string =>
  new Date(utcMidnight(d) + MS_DAY - 1).toISOString()
