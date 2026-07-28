import type { Payload } from 'payload'
import {
  generateDepartureDates,
  dayKeyOf,
  addNights,
  rangeStartISO,
  rangeEndISO,
  utcMidnight,
} from './generateDates'

const MAX_OCCURRENCES = 366

const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'object' && 'id' in (v as any)) return String((v as any).id)
  return String(v)
}

const addMonthsUTC = (base: Date, months: number): Date =>
  new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + months, base.getUTCDate()))

export type SyncResult = {
  ok: boolean
  error?: string
  willCreate: number
  willSkip: number
  truncated: boolean
  dates: string[]
  skippedDates: string[]
  created?: number
}

/**
 * Compute (and, on commit, materialize) a schedule's departures. Shared by the
 * on-demand generate endpoint and the perpetual rolling-window cron.
 *
 * - `on_date`  → generate [startDate, untilDate].
 * - `perpetual`→ generate [max(startDate, today), today + horizonMonths]; the cron
 *   re-runs this to keep the rolling window materialized.
 *
 * Dedupe is by calendar day-key (`iso.slice(0,10)`, same as CalendarView), and commit
 * is strictly ADDITIVE — existing departures (incl. booked) are never touched.
 */
export async function syncSchedule(
  payload: Payload,
  schedule: any,
  mode: 'preview' | 'commit',
): Promise<SyncResult> {
  const empty = { willCreate: 0, willSkip: 0, truncated: false, dates: [], skippedDates: [] }

  const packageId = idOf(schedule?.package)
  const days = (schedule?.daysOfWeek ?? [])
    .map((d: unknown) => Number(d))
    .filter((n: number) => !Number.isNaN(n))
  const perpetual = schedule?.endsMode === 'perpetual'

  if (!packageId || days.length === 0 || !schedule?.startDate || (!perpetual && !schedule?.untilDate)) {
    return {
      ok: false,
      error: 'Schedule incomplete: package, start date, days of week, and an end date (unless perpetual) are required.',
      ...empty,
    }
  }

  const now = new Date()
  const todayMid = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const startMs = utcMidnight(schedule.startDate)
  const effStart = new Date(perpetual ? Math.max(startMs, todayMid.getTime()) : startMs)
  const effUntil = perpetual ? addMonthsUTC(todayMid, schedule.horizonMonths || 12) : new Date(utcMidnight(schedule.untilDate))

  const blackout = (schedule.blackoutDates ?? [])
    .map((b: any) => dayKeyOf(b?.date))
    .filter(Boolean) as string[]

  const { dates, truncated } = generateDepartureDates({
    startDate: effStart,
    untilDate: effUntil,
    daysOfWeek: days,
    intervalWeeks: schedule.intervalWeeks || 1,
    blackout,
    timeHHMM: schedule.departureTime,
    cap: MAX_OCCURRENCES,
  })

  // Dedupe against existing departures for this package in the same window.
  const existing = await payload.find({
    collection: 'package-departures',
    pagination: false,
    depth: 0,
    overrideAccess: true,
    limit: 5000,
    where: {
      and: [
        { package: { equals: packageId } },
        { startDate: { greater_than_equal: rangeStartISO(effStart) } },
        { startDate: { less_than_equal: rangeEndISO(effUntil) } },
      ],
    },
  })
  const existingKeys = new Set(existing.docs.map((d: any) => dayKeyOf(d.startDate)))

  const keyOf = (d: Date) => d.toISOString().slice(0, 10)
  const toCreate = dates.filter((d) => !existingKeys.has(keyOf(d)))
  const skipped = dates.filter((d) => existingKeys.has(keyOf(d)))

  const base = {
    ok: true as const,
    willCreate: toCreate.length,
    willSkip: skipped.length,
    truncated,
    dates: toCreate.map(keyOf),
    skippedDates: skipped.map(keyOf),
  }

  if (mode === 'preview') return base

  const df = schedule.departureDefaults ?? {}
  let created = 0
  for (const d of toCreate) {
    const data: any = {
      package: packageId,
      startDate: d.toISOString(),
      currency: df.currency ?? 'INR',
      status: df.status ?? 'open',
      schedule: idOf(schedule),
    }
    if (df.capacity != null) data.capacity = df.capacity
    if (df.priceOverride != null) data.priceOverride = df.priceOverride
    if (df.label) data.label = df.label
    if (schedule.tripNights != null) data.endDate = addNights(d, schedule.tripNights)
    if (df.acceptOnlinePaymentMode === 'enabled') data.acceptOnlinePayment = true
    else if (df.acceptOnlinePaymentMode === 'disabled') data.acceptOnlinePayment = false
    // 'inherit' → omit; PackageDepartures.beforeChange inherits from the package default.
    try {
      await payload.create({ collection: 'package-departures', overrideAccess: true, data })
      created++
    } catch (e) {
      payload.logger.error(`generate departure failed for ${data.startDate}: ${e}`)
    }
  }

  await payload.update({
    collection: 'departure-schedules',
    id: idOf(schedule)!,
    overrideAccess: true,
    data: { lastGeneratedAt: now.toISOString(), generatedCount: (schedule.generatedCount || 0) + created },
  })

  return { ...base, created }
}
