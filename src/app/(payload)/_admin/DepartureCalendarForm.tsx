'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

import type {
  Currency,
  DepartureStatus,
  EndsMode,
  PackageOption,
  PayMode,
  ScheduleDoc,
  ScheduleOption,
} from './departureCalendar.types'

/* ───────────────────────── constants & helpers ───────────────────────── */

const WEEKDAYS: { v: string; short: string; long: string }[] = [
  { v: '1', short: 'MON', long: 'Monday' },
  { v: '2', short: 'TUE', long: 'Tuesday' },
  { v: '3', short: 'WED', long: 'Wednesday' },
  { v: '4', short: 'THU', long: 'Thursday' },
  { v: '5', short: 'FRI', long: 'Friday' },
  { v: '6', short: 'SAT', long: 'Saturday' },
  { v: '0', short: 'SUN', long: 'Sunday' },
]

const STATUS_OPTIONS: { v: DepartureStatus; label: string }[] = [
  { v: 'open', label: 'Open' },
  { v: 'waitlist', label: 'Waitlist' },
  { v: 'closed', label: 'Closed' },
  { v: 'cancelled', label: 'Cancelled' },
  { v: 'departed', label: 'Departed' },
]

const PAY_OPTIONS: { v: PayMode; label: string }[] = [
  { v: 'inherit', label: 'Inherit from package' },
  { v: 'enabled', label: 'Force enabled' },
  { v: 'disabled', label: 'Force disabled' },
]

const CURRENCY_OPTIONS: { v: Currency; label: string; sym: string }[] = [
  { v: 'INR', label: 'INR (₹)', sym: '₹' },
  { v: 'USD', label: 'USD ($)', sym: '$' },
  { v: 'EUR', label: 'EUR (€)', sym: '€' },
  { v: 'GBP', label: 'GBP (£)', sym: '£' },
]

const symOf = (c: Currency) => CURRENCY_OPTIONS.find((o) => o.v === c)?.sym ?? ''

/** yyyy-mm-dd → Date at noon UTC (matches how the generator reads dates). */
const parseDay = (s: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(`${s}T12:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
const fmtDay = (s: string): string => {
  const d = parseDay(s)
  return d
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : ''
}
const fmtDayLong = (s: string): string => {
  const d = parseDay(s)
  return d
    ? d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : s
}
const toApiDate = (s: string): string => `${s}T12:00:00.000Z`

const parseNights = (duration: string): number | null => {
  const m = duration.match(/(\d+)\s*N(?:ights?)?\b/i) || duration.match(/(\d+)\s*Nights?/i)
  return m ? Number(m[1]) : null
}

const joinList = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

const numOrNull = (s: string): number | null => {
  if (s.trim() === '') return null
  const n = Number(s)
  return Number.isNaN(n) ? null : n
}

/* ───────────────────────────── form state ───────────────────────────── */

type FormState = {
  packageId: string
  startDate: string
  endsMode: EndsMode
  untilDate: string
  horizonMonths: string
  intervalWeeks: string
  days: string[]
  departureTime: string
  blackout: string[]
  tripNights: string
  capacity: string
  label: string
  status: DepartureStatus
  payMode: PayMode
  priceOverride: string
  currency: Currency
}

const emptyForm: FormState = {
  packageId: '',
  startDate: '',
  endsMode: 'on_date',
  untilDate: '',
  horizonMonths: '12',
  intervalWeeks: '1',
  days: [],
  departureTime: '',
  blackout: [],
  tripNights: '',
  capacity: '',
  label: '',
  status: 'open',
  payMode: 'inherit',
  priceOverride: '',
  currency: 'INR',
}

const fromSchedule = (s: ScheduleDoc): FormState => ({
  packageId: s.packageId,
  startDate: s.startDate,
  endsMode: s.endsMode,
  untilDate: s.untilDate,
  horizonMonths: String(s.horizonMonths ?? 12),
  intervalWeeks: String(s.intervalWeeks ?? 1),
  days: s.daysOfWeek,
  departureTime: s.departureTime,
  blackout: s.blackoutDates,
  tripNights: s.tripNights == null ? '' : String(s.tripNights),
  capacity: s.capacity == null ? '' : String(s.capacity),
  label: s.label,
  status: s.status,
  payMode: s.acceptOnlinePaymentMode,
  priceOverride: s.priceOverride == null ? '' : String(s.priceOverride),
  currency: s.currency,
})

type Errors = Partial<Record<'packageId' | 'startDate' | 'days' | 'untilDate' | 'horizonMonths' | 'departureTime' | 'blackout' | 'capacity', string>>

const FIELD_LABELS: Record<keyof Errors, string> = {
  packageId: 'Package',
  startDate: 'Start date',
  days: 'Departure days',
  untilDate: 'End date',
  horizonMonths: 'Months ahead',
  departureTime: 'Departure time',
  blackout: 'Blackout dates',
  capacity: 'Total seats',
}

const validate = (f: FormState): Errors => {
  const e: Errors = {}
  if (!f.packageId) e.packageId = 'Choose the package this schedule belongs to.'
  if (!parseDay(f.startDate)) e.startDate = 'Pick the first departure date.'
  if (f.days.length === 0) e.days = 'Select at least one departure day.'
  if (f.endsMode === 'on_date') {
    if (!parseDay(f.untilDate)) e.untilDate = 'An end date is required unless the schedule is rolling.'
    else if (parseDay(f.startDate) && parseDay(f.untilDate)! < parseDay(f.startDate)!)
      e.untilDate = 'End date must be on or after the start date.'
  } else {
    const m = Number(f.horizonMonths)
    if (!Number.isInteger(m) || m < 1 || m > 36) e.horizonMonths = 'Enter 1 to 36 months.'
  }
  if (f.departureTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(f.departureTime)) e.departureTime = 'Use 24-hour HH:MM.'
  if (f.blackout.some((b) => !parseDay(b))) e.blackout = 'Every blackout row needs a date.'
  else if (parseDay(f.startDate)) {
    const start = parseDay(f.startDate)!
    const end = f.endsMode === 'on_date' ? parseDay(f.untilDate) : null
    if (f.blackout.some((b) => parseDay(b)! < start || (end && parseDay(b)! > end)))
      e.blackout = 'Blackout dates must fall between the start and end date.'
  }
  if (f.capacity !== '' && (numOrNull(f.capacity) == null || Number(f.capacity) < 0)) e.capacity = 'Enter 0 or more seats.'
  return e
}

const buildBody = (f: FormState) => ({
  package: f.packageId,
  startDate: toApiDate(f.startDate),
  endsMode: f.endsMode,
  untilDate: f.endsMode === 'on_date' && f.untilDate ? toApiDate(f.untilDate) : null,
  horizonMonths: f.endsMode === 'perpetual' ? Number(f.horizonMonths) : 12,
  daysOfWeek: f.days,
  intervalWeeks: Number(f.intervalWeeks) || 1,
  departureTime: f.departureTime || null,
  tripNights: numOrNull(f.tripNights),
  blackoutDates: f.blackout.map((b) => ({ date: toApiDate(b) })),
  departureDefaults: {
    capacity: numOrNull(f.capacity),
    label: f.label || null,
    priceOverride: numOrNull(f.priceOverride),
    currency: f.currency,
    status: f.status,
    acceptOnlinePaymentMode: f.payMode,
  },
})

const apiError = (json: any, fallback: string): string => {
  const first = json?.errors?.[0]
  const nested = first?.data?.errors?.[0]
  if (nested?.message) return `${nested.path ? `${nested.path}: ` : ''}${nested.message}`
  return first?.message || json?.message || fallback
}

/* ───────────────────────────── small pieces ───────────────────────────── */

const Section: React.FC<{
  n: number
  title: string
  helper: string
  tag?: string
  tone?: 'default' | 'muted'
  children: React.ReactNode
}> = ({ n, title, helper, tag, tone = 'default', children }) => {
  const [open, setOpen] = useState(true)
  return (
    <section className={`lt-section${open ? '' : ' is-collapsed'}${tone === 'muted' ? ' is-muted' : ''}`} id={`lt-section-${n}`}>
      <header className="lt-section__head">
        <button
          aria-expanded={open}
          className="lt-section__toggle"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="lt-section__title">
            {n}. {title}
          </span>
          {tag ? <span className="lt-tag">{tag}</span> : null}
          <svg aria-hidden="true" className="lt-section__caret" height="14" viewBox="0 0 12 12" width="14">
            <path d="m2.5 7.5 3.5-3.5 3.5 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
          </svg>
        </button>
      </header>
      {open && (
        <div className="lt-section__body">
          <p className="lt-helper">{helper}</p>
          {children}
        </div>
      )}
    </section>
  )
}

const Field: React.FC<{
  label: string
  required?: boolean
  hint?: string
  error?: string
  wide?: boolean
  children: React.ReactNode
}> = ({ label, required, hint, error, wide, children }) => (
  <div className={`lt-field${wide ? ' lt-field--wide' : ''}${error ? ' has-error' : ''}`}>
    <label className="lt-label">
      <span>
        {label}
        {required ? <b aria-hidden="true"> *</b> : null}
      </span>
      {hint ? <em>{hint}</em> : null}
    </label>
    {children}
    {error ? <span className="lt-error" role="alert">{error}</span> : null}
  </div>
)

const NotStored: React.FC<{ what: string }> = ({ what }) => (
  <div className="lt-note lt-note--warn">
    <strong>Not saved yet.</strong> {what} needs new fields in the data model, so these controls are
    shown for planning only — nothing typed here is stored.
  </div>
)

/* ───────────────────────────── the form ───────────────────────────── */

export const DepartureCalendarForm: React.FC<{
  adminRoute: string
  canEdit: boolean
  notFound: boolean
  packages: PackageOption[]
  schedule: ScheduleDoc | null
  schedules: ScheduleOption[]
}> = ({ adminRoute, canEdit, notFound, packages, schedule, schedules }) => {
  const router = useRouter()
  const initial = useRef<FormState>(schedule ? fromSchedule(schedule) : emptyForm)
  const [form, setForm] = useState<FormState>(initial.current)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [meta, setMeta] = useState({
    lastGeneratedAt: schedule?.lastGeneratedAt ?? null,
    generatedCount: schedule?.generatedCount ?? 0,
  })
  const [busy, setBusy] = useState<false | 'preview' | 'commit'>(false)
  const [preview, setPreview] = useState<null | {
    willCreate: number
    willSkip: number
    truncated: boolean
    dates: string[]
    skippedDates: string[]
  }>(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(initial.current)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const pkg = useMemo(() => packages.find((p) => p.id === form.packageId) ?? null, [packages, form.packageId])
  const pending = useMemo(() => validate(form), [form])
  const pendingKeys = Object.keys(pending) as (keyof Errors)[]

  const days = WEEKDAYS.filter((d) => form.days.includes(d.v))
  const nights = numOrNull(form.tripNights)

  const summary = useMemo(() => {
    if (!form.days.length || !parseDay(form.startDate)) {
      return 'Choose the departure days and a start date to see a plain-English summary of this rule.'
    }
    const every =
      form.intervalWeeks === '1'
        ? 'Every'
        : `Every ${form.intervalWeeks} weeks on`
    const when = `${every} ${joinList(days.map((d) => d.long))}`
    const time = form.departureTime ? ` at ${form.departureTime}` : ''
    const range =
      form.endsMode === 'perpetual'
        ? ` from ${fmtDay(form.startDate)}, always keeping the next ${form.horizonMonths || '12'} months generated`
        : parseDay(form.untilDate)
          ? ` from ${fmtDay(form.startDate)} until ${fmtDay(form.untilDate)}`
          : ` from ${fmtDay(form.startDate)}`
    const skip = form.blackout.length
      ? `, skipping ${form.blackout.length} date${form.blackout.length > 1 ? 's' : ''}`
      : ''
    return `${when}${time}${range}${skip}.`
  }, [form, days])

  /* ── actions ── */

  const onPickPackage = (id: string) => {
    setForm((f) => {
      const next = { ...f, packageId: id }
      const p = packages.find((x) => x.id === id)
      // Helpful default only: never overwrite something the admin already typed.
      if (p && f.tripNights === '') {
        const n = parseNights(p.duration)
        if (n != null) next.tripNights = String(n)
      }
      if (p && f.currency === 'INR' && f.priceOverride === '') next.currency = p.currency
      return next
    })
    setPreview(null)
  }

  const toggleDay = (v: string) =>
    set('days', form.days.includes(v) ? form.days.filter((d) => d !== v) : [...form.days, v])

  const loadMeta = async (id: string) => {
    try {
      const res = await fetch(`/api/departure-schedules/${id}?depth=0`, { credentials: 'include' })
      if (!res.ok) return
      const doc = await res.json()
      setMeta({
        lastGeneratedAt: typeof doc.lastGeneratedAt === 'string' ? doc.lastGeneratedAt : null,
        generatedCount: typeof doc.generatedCount === 'number' ? doc.generatedCount : 0,
      })
    } catch {
      /* ignore */
    }
  }

  const runGenerate = async (mode: 'preview' | 'commit') => {
    if (!schedule) return
    setBusy(mode)
    try {
      const res = await fetch('/api/departures/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: schedule.id, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
      if (mode === 'preview') {
        setPreview(data)
      } else {
        toast.success(`Created ${data.created} departure(s); skipped ${data.willSkip} existing.`)
        setPreview(null)
        void loadMeta(schedule.id)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setBusy(false)
    }
  }

  const save = async (thenPreview = false) => {
    if (!canEdit) return
    const errs = validate(form)
    setErrors(errs)
    const keys = Object.keys(errs) as (keyof Errors)[]
    if (keys.length) {
      toast.error(`Please fix: ${keys.map((k) => FIELD_LABELS[k]).join(', ')}`)
      document.querySelector('.lt-field.has-error, .lt-field--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch(schedule ? `/api/departure-schedules/${schedule.id}` : '/api/departure-schedules', {
        method: schedule ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(form)),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(apiError(json, `Save failed (${res.status})`))
        return
      }
      const doc = json?.doc
      toast.success(schedule ? 'Schedule saved.' : 'Schedule created.')
      if (!schedule) {
        // Reload the page on the new record so the form reflects exactly what is stored.
        router.replace(`${adminRoute}/departure-calendar?id=${doc?.id}`)
        return
      }
      initial.current = form
      setForm({ ...form }) // re-render so "unsaved" clears
      setPreview(null)
      void loadMeta(schedule.id)
      if (thenPreview) await runGenerate('preview')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const statusLabel = !schedule ? 'New schedule' : dirty ? 'Unsaved changes' : 'Saved'
  const statusTone = !schedule || dirty ? 'amber' : 'green'
  const canGenerate = Boolean(schedule) && !dirty && !busy

  /* ── render ── */

  if (notFound) {
    return (
      <div className="lt-dc">
        <div className="lt-dc__hero">
          <h1 className="lt-dc__title">Departure Calendar</h1>
        </div>
        <div className="lt-note lt-note--warn">
          That schedule could not be found (it may have been deleted).{' '}
          <a href={`${adminRoute}/departure-calendar`}>Start a new schedule</a>
        </div>
      </div>
    )
  }

  return (
    <div className="lt-dc">
      {/* ── hero ── */}
      <div className="lt-dc__hero">
        <div>
          <h1 className="lt-dc__title">Departure Calendar</h1>
          <p className="lt-dc__sub">
            Set up recurring departure dates, seats and pricing without a developer.
          </p>
        </div>
        <div className="lt-dc__actions">
          <span className={`lt-pill lt-pill--${statusTone}`}>
            <i /> {statusLabel}
          </span>
          <select
            aria-label="Open an existing schedule"
            className="lt-input lt-input--compact"
            onChange={(e) =>
              router.push(
                e.target.value ? `${adminRoute}/departure-calendar?id=${e.target.value}` : `${adminRoute}/departure-calendar`,
              )
            }
            value={schedule?.id ?? ''}
          >
            <option value="">+ New schedule</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <button
            className="lt-btn lt-btn--secondary"
            disabled={!canGenerate}
            onClick={() => runGenerate('preview')}
            title={!schedule ? 'Save the schedule first' : dirty ? 'Save your changes first' : undefined}
            type="button"
          >
            Preview dates
          </button>
          <button
            className="lt-btn lt-btn--primary"
            disabled={!canEdit || saving}
            onClick={() => save(false)}
            type="button"
          >
            {saving ? 'Saving…' : 'Save schedule'}
          </button>
        </div>
      </div>

      {!canEdit && (
        <div className="lt-note lt-note--warn">You have read-only access to departure schedules.</div>
      )}

      <div className="lt-dc__layout">
        <fieldset className="lt-dc__main" disabled={!canEdit}>
          {/* ── 1. schedule ── */}
          <Section
            helper="Choose the days this trip runs. Individual dates are created for you."
            n={1}
            tag="Required"
            title="Departure Schedule"
          >
            <div className="lt-field lt-field--wide">
              <span className="lt-label"><span>Schedule type</span></span>
              <div className="lt-seg" role="group" aria-label="Schedule type">
                <button aria-pressed="true" className="lt-seg__btn is-active" type="button">
                  Recurring Rule
                </button>
                <a className="lt-seg__btn" href={`${adminRoute}/collections/package-departures/create`}>
                  Specific Dates
                </a>
              </div>
              <span className="lt-hint">
                “Specific Dates” opens the single-departure form for one-off dates.
              </span>
            </div>

            <div className="lt-grid">
              <Field label="Repeat frequency">
                <select
                  className="lt-input"
                  onChange={(e) => set('intervalWeeks', e.target.value)}
                  value={form.intervalWeeks}
                >
                  <option value="1">Every week</option>
                  <option value="2">Every 2 weeks</option>
                  <option value="3">Every 3 weeks</option>
                  <option value="4">Every 4 weeks</option>
                </select>
              </Field>
              <Field hint="24h, optional" error={errors.departureTime ?? undefined} label="Departure time">
                <input
                  className="lt-input"
                  onChange={(e) => set('departureTime', e.target.value)}
                  type="time"
                  value={form.departureTime}
                />
              </Field>
            </div>

            <Field
              error={errors.days}
              hint="select one or more"
              label="Departure days"
              required
              wide
            >
              <div className="lt-days" role="group" aria-label="Departure days">
                {WEEKDAYS.map((d) => (
                  <button
                    aria-pressed={form.days.includes(d.v)}
                    className={`lt-day${form.days.includes(d.v) ? ' is-on' : ''}`}
                    key={d.v}
                    onClick={() => toggleDay(d.v)}
                    type="button"
                  >
                    {d.short}
                  </button>
                ))}
              </div>
              <span className="lt-hint">
                {days.length
                  ? `Selected: ${days.length} day${days.length > 1 ? 's' : ''} (${days.map((d) => d.long).join(', ')}).`
                  : 'No days selected yet.'}
              </span>
            </Field>

            <div className="lt-grid">
              <Field error={errors.startDate} label="Start date" required>
                <input
                  className="lt-input"
                  onChange={(e) => set('startDate', e.target.value)}
                  type="date"
                  value={form.startDate}
                />
              </Field>
              <Field label="Ends">
                <select
                  className="lt-input"
                  onChange={(e) => set('endsMode', e.target.value as EndsMode)}
                  value={form.endsMode}
                >
                  <option value="on_date">Until a date</option>
                  <option value="perpetual">Rolling (keep generating automatically)</option>
                </select>
              </Field>
              {form.endsMode === 'on_date' ? (
                <Field error={errors.untilDate} label="End date" required>
                  <input
                    className="lt-input"
                    onChange={(e) => set('untilDate', e.target.value)}
                    type="date"
                    value={form.untilDate}
                  />
                </Field>
              ) : (
                <Field error={errors.horizonMonths} hint="1–36" label="Months to keep ahead">
                  <input
                    className="lt-input"
                    max={36}
                    min={1}
                    onChange={(e) => set('horizonMonths', e.target.value)}
                    type="number"
                    value={form.horizonMonths}
                  />
                </Field>
              )}
            </div>

            <Field error={errors.blackout} hint="holidays, sold-out weeks" label="Blackout dates" wide>
              <div className="lt-repeater">
                {form.blackout.map((b, i) => (
                  <div className="lt-repeater__row" key={i}>
                    <input
                      aria-label={`Blackout date ${i + 1}`}
                      className="lt-input"
                      onChange={(e) =>
                        set('blackout', form.blackout.map((x, j) => (j === i ? e.target.value : x)))
                      }
                      type="date"
                      value={b}
                    />
                    <button
                      aria-label="Remove blackout date"
                      className="lt-icon-btn"
                      onClick={() => set('blackout', form.blackout.filter((_, j) => j !== i))}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button className="lt-link-btn" onClick={() => set('blackout', [...form.blackout, ''])} type="button">
                  + Add blackout date
                </button>
              </div>
            </Field>

            <div className="lt-note lt-note--info">
              <strong>Rule summary.</strong> {summary}
            </div>
          </Section>

          {/* ── 2. package ── */}
          <Section
            helper="Which trip is this? Pick an existing fixed-departure package."
            n={2}
            tag="Required"
            title="Package Information"
          >
            {packages.length === 0 ? (
              <div className="lt-note lt-note--warn">
                No packages are set to “Fixed Departures” yet. Open a package and set its Schedule Type to
                Fixed Departures, then come back. <a href={`${adminRoute}/collections/packages`}>Go to Packages</a>
              </div>
            ) : (
              <>
                <Field error={errors.packageId} label="Package" required wide>
                  <select
                    className="lt-input"
                    onChange={(e) => onPickPackage(e.target.value)}
                    value={form.packageId}
                  >
                    <option value="">Select a package…</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {pkg && (
                  <div className="lt-readonly">
                    <div className="lt-readonly__head">
                      <strong>{pkg.name}</strong>
                      <a href={`${adminRoute}/collections/packages/${pkg.id}`}>Edit package details →</a>
                    </div>
                    {pkg.tagline ? <p className="lt-readonly__line">{pkg.tagline}</p> : null}
                    {pkg.summary ? <p className="lt-readonly__line">{pkg.summary}</p> : null}
                    <dl className="lt-dl">
                      <div>
                        <dt>Destinations</dt>
                        <dd>{pkg.destinations.length ? pkg.destinations.join(', ') : '—'}</dd>
                      </div>
                      <div>
                        <dt>Package duration</dt>
                        <dd>{pkg.duration || '—'}</dd>
                      </div>
                    </dl>
                    {pkg.highlights.length ? (
                      <div className="lt-chips" aria-label="Package highlights">
                        {pkg.highlights.map((h, i) => (
                          <span className="lt-chip" key={i}>{h}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="lt-grid">
                  <Field hint="return date = start + nights" label="Trip length (nights)">
                    <input
                      className="lt-input"
                      min={0}
                      onChange={(e) => set('tripNights', e.target.value)}
                      placeholder="e.g. 5"
                      type="number"
                      value={form.tripNights}
                    />
                  </Field>
                  <Field label="Shown as">
                    <input
                      className="lt-input"
                      disabled
                      value={nights != null ? `${nights} Night${nights === 1 ? '' : 's'} / ${nights + 1} Days` : 'Not set'}
                      readOnly
                    />
                  </Field>
                </div>
              </>
            )}
          </Section>

          {/* ── 3. seats & status ── */}
          <Section
            helper="How many travellers can book, and is each departure open for sale?"
            n={3}
            tag="Applied to every generated departure"
            title="Seats, Status & Booking Rules"
          >
            <div className="lt-grid">
              <Field error={errors.capacity} hint="per departure" label="Total seats">
                <input
                  className="lt-input"
                  min={0}
                  onChange={(e) => set('capacity', e.target.value)}
                  placeholder="e.g. 24"
                  type="number"
                  value={form.capacity}
                />
              </Field>
              <Field hint="e.g. Diwali Special" label="Departure label">
                <input
                  className="lt-input"
                  onChange={(e) => set('label', e.target.value)}
                  placeholder="Weekly Batch"
                  value={form.label}
                />
              </Field>
              <Field label="Status">
                <select
                  className="lt-input"
                  onChange={(e) => set('status', e.target.value as DepartureStatus)}
                  value={form.status}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Online payment">
                <select
                  className="lt-input"
                  onChange={(e) => set('payMode', e.target.value as PayMode)}
                  value={form.payMode}
                >
                  {PAY_OPTIONS.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="lt-hint">
              Seats booked is tracked per departure and updates automatically from confirmed bookings, so it
              cannot be edited here.
            </p>
          </Section>

          {/* ── 4. transport ── */}
          <Section
            helper="Suggested ways to reach the start point. For staff and customer reference only."
            n={4}
            tag="Optional · planned"
            title="Recommended Transport"
            tone="muted"
          >
            <NotStored what="Transport details" />
            <fieldset className="lt-fieldset" disabled>
              <div className="lt-grid">
                <Field label="Airline"><input className="lt-input" placeholder="e.g. Indigo / Air India" /></Field>
                <Field label="Flight number"><input className="lt-input" placeholder="e.g. 6E-204" /></Field>
                <Field label="Dep airport"><input className="lt-input" placeholder="Airport code" /></Field>
                <Field label="Arr airport"><input className="lt-input" placeholder="Airport code" /></Field>
                <Field label="Train name"><input className="lt-input" placeholder="e.g. Vande Bharat Express" /></Field>
                <Field label="Train number"><input className="lt-input" placeholder="e.g. 22436" /></Field>
                <Field label="Dep station"><input className="lt-input" placeholder="Station code" /></Field>
                <Field label="Arr station"><input className="lt-input" placeholder="Station code" /></Field>
              </div>
            </fieldset>
          </Section>

          {/* ── 5. pricing ── */}
          <Section
            helper="Leave the price blank to use the package price."
            n={5}
            title="Pricing & Commercials"
          >
            {pkg && (
              <div className="lt-note lt-note--info">
                Package price: <strong>{pkg.price != null ? `${symOf(pkg.currency)}${pkg.price.toLocaleString('en-IN')}` : 'not set'}</strong>
                {pkg.discountedPrice != null ? (
                  <> · discounted <strong>{symOf(pkg.currency)}{pkg.discountedPrice.toLocaleString('en-IN')}</strong></>
                ) : null}
                {' '}· change it in <a href={`${adminRoute}/collections/packages/${pkg.id}`}>the package</a>.
              </div>
            )}
            <div className="lt-grid">
              <Field hint="overrides the package price" label="Departure price">
                <input
                  className="lt-input"
                  min={0}
                  onChange={(e) => set('priceOverride', e.target.value)}
                  placeholder="0.00"
                  type="number"
                  value={form.priceOverride}
                />
              </Field>
              <Field label="Currency">
                <select
                  className="lt-input"
                  onChange={(e) => set('currency', e.target.value as Currency)}
                  value={form.currency}
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.v} value={c.v}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <NotStored what="Child / infant prices, tax settings and surcharges" />
            <fieldset className="lt-fieldset" disabled>
              <div className="lt-grid">
                <Field label="Child price"><input className="lt-input" placeholder="0.00" /></Field>
                <Field label="Infant price"><input className="lt-input" placeholder="0.00" /></Field>
                <Field label="Additional charge"><input className="lt-input" placeholder="e.g. Peak season surcharge" /></Field>
                <Field label="Amount"><input className="lt-input" placeholder="0.00" /></Field>
              </div>
            </fieldset>
          </Section>

          {/* ── 6. day by day ── */}
          <Section
            helper="Shown on the package page. It comes from the linked package."
            n={6}
            title="Day-by-Day Plan"
          >
            {!pkg ? (
              <div className="lt-note lt-note--info">Select a package in section 2 to see its itinerary here.</div>
            ) : pkg.days.length === 0 ? (
              <div className="lt-note lt-note--warn">
                This package has no itinerary days yet.{' '}
                <a href={`${adminRoute}/collections/packages/${pkg.id}`}>Add the itinerary in the package</a>
              </div>
            ) : (
              <>
                <ol className="lt-days-list">
                  {pkg.days.map((d, i) => (
                    <li key={i}>
                      <span className="lt-days-list__n">Day {d.day}</span>
                      <span>{d.title || 'Untitled day'}</span>
                    </li>
                  ))}
                </ol>
                <a className="lt-link-btn" href={`${adminRoute}/collections/packages/${pkg.id}`}>
                  Edit itinerary in the package →
                </a>
              </>
            )}
          </Section>
        </fieldset>

        {/* ── right rail ── */}
        <aside className="lt-dc__rail">
          <div className="lt-rail-card">
            <h3>Status</h3>
            <p className="lt-rail-line">
              <span className={`lt-pill lt-pill--${statusTone}`}><i /> {statusLabel}</span>
            </p>
            {schedule ? <p className="lt-rail-line lt-muted">{schedule.title}</p> : null}
          </div>

          <div className="lt-rail-card">
            <h3>Generated departures</h3>
            <p className="lt-rail-line lt-muted">
              {meta.lastGeneratedAt
                ? `Last generated ${new Date(meta.lastGeneratedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
                : 'Last generated: never'}{' '}
              · {meta.generatedCount} departure{meta.generatedCount === 1 ? '' : 's'}
            </p>
            <div className="lt-rail-actions">
              <button
                className="lt-btn lt-btn--secondary"
                disabled={!canGenerate}
                onClick={() => runGenerate('preview')}
                type="button"
              >
                {busy === 'preview' ? 'Previewing…' : 'Preview dates'}
              </button>
              <button
                className="lt-btn lt-btn--primary"
                disabled={!canGenerate || (preview?.willCreate ?? 0) === 0}
                onClick={() => runGenerate('commit')}
                type="button"
              >
                {busy === 'commit' ? 'Generating…' : preview ? `Generate ${preview.willCreate}` : 'Generate departures'}
              </button>
            </div>
            {!schedule ? (
              <p className="lt-hint">Save the schedule first to preview and generate departures.</p>
            ) : dirty ? (
              <p className="lt-hint">You have unsaved changes — save before previewing.</p>
            ) : null}

            {preview && (
              <div className="lt-preview">
                <p>
                  Will create <strong>{preview.willCreate}</strong>, skip <strong>{preview.willSkip}</strong> existing.
                  {preview.truncated ? <span className="lt-warn"> (capped — narrow the date range)</span> : null}
                </p>
                <ul>
                  {preview.dates.slice(0, 5).map((d) => (
                    <li key={d}>+ {fmtDayLong(d)}</li>
                  ))}
                  {preview.dates.length > 5 ? <li className="lt-muted">+ {preview.dates.length - 5} more</li> : null}
                  {preview.skippedDates.slice(0, 2).map((d) => (
                    <li className="lt-muted" key={`s-${d}`}>= {fmtDayLong(d)} (exists)</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="lt-hint">
              Additive: existing departures (including booked ones) are never changed or deleted.
            </p>
            <a className="lt-link-btn" href={`${adminRoute}/package-manager`}>
              Open all departures (calendar &amp; list) →
            </a>
          </div>

          <div className="lt-rail-card">
            <h3>Checklist</h3>
            {pendingKeys.length === 0 ? (
              <p className="lt-rail-line lt-ok">All required fields are filled in.</p>
            ) : (
              <>
                <p className="lt-rail-line lt-warn">
                  {pendingKeys.length} required field{pendingKeys.length > 1 ? 's' : ''} pending
                </p>
                <ul className="lt-checklist">
                  {pendingKeys.map((k) => (
                    <li key={k}>{FIELD_LABELS[k]}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── sticky action bar ── */}
      <div className="lt-bar" role="region" aria-label="Form actions">
        <div className="lt-bar__left">
          <span className={`lt-dot lt-dot--${statusTone}`} />
          <span>{statusLabel}</span>
          {pendingKeys.length > 0 && (
            <span className="lt-warn">{pendingKeys.length} required field{pendingKeys.length > 1 ? 's' : ''} pending</span>
          )}
        </div>
        <div className="lt-bar__right">
          <button
            className="lt-btn lt-btn--ghost"
            onClick={() => router.push(adminRoute)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="lt-btn lt-btn--secondary"
            disabled={!canEdit || saving}
            onClick={() => save(true)}
            type="button"
          >
            Save &amp; preview dates
          </button>
          <button
            className="lt-btn lt-btn--primary"
            disabled={!canEdit || saving}
            onClick={() => save(false)}
            type="button"
          >
            {saving ? 'Saving…' : 'Save schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DepartureCalendarForm
