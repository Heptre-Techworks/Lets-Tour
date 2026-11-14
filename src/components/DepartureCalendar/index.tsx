'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { RazorpayCheckoutButton } from '@/components/Payments/RazorpayCheckoutButton'

export type CalendarDeparture = {
  id: string
  packageId: string
  packageName: string
  packageSlug?: string | null
  packageImage?: string | null
  duration?: string | null
  tagline?: string | null
  label?: string | null
  startDate: string
  endDate?: string | null
  perPax: number
  currency: string
  seatsLeft: number | null // null = no seat cap set
  waitlist?: boolean
  acceptOnlinePayment?: boolean
}

export type CalendarTransport = {
  id: string
  mode: 'flight' | 'train'
  operator: string
  number?: string | null
  vehicle?: string | null
  departTime: string
  departCode?: string | null
  departCity: string
  arriveTime: string
  arriveCode?: string | null
  arriveCity: string
  duration?: string | null
  stops?: string | null
  recommended?: boolean
}

export type CalendarDestination = {
  name: string
  slug: string
  image?: string | null
  tagline?: string | null
}

type Props = {
  destination: CalendarDestination
  departures: CalendarDeparture[]
  transport: CalendarTransport[]
  paymentsEnabled: boolean
  initialPackageId?: string | null
}

const symbolFor = (c: string) =>
  c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : ''

// Departures are bucketed by their ISO date substring — the same rule the admin
// calendar uses — so a departure always lands on the day the admin sees.
const dayKey = (iso: string) => iso.slice(0, 10)
const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const fmtLong = (iso?: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = dayKey(iso).split('-').map(Number)
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`
}

const soldOut = (d: CalendarDeparture) => d.seatsLeft !== null && d.seatsLeft <= 0

/** Nights/days derived from start+end when available, else the package's own text. */
const durationOf = (d: CalendarDeparture) => {
  if (d.endDate) {
    const days =
      Math.round((Date.parse(dayKey(d.endDate)) - Date.parse(dayKey(d.startDate))) / 86_400_000) + 1
    if (days > 0) return `${days - 1}N / ${days}D`
  }
  return d.duration || null
}

const Stepper: React.FC<{
  label: string
  hint: string
  value: number
  min: number
  onChange: (n: number) => void
  disabledInc?: boolean
}> = ({ label, hint, value, min, onChange, disabledInc }) => (
  <div className="flex flex-col items-center rounded-xl bg-slate-50 p-3 text-center">
    <div className="text-xs font-semibold text-slate-900">{label}</div>
    <div className="mb-2 text-[11px] text-slate-500">{hint}</div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`decrease ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-7 w-7 rounded-md border border-slate-200 bg-white text-base leading-none disabled:opacity-40"
      >
        −
      </button>
      <span className="w-5 text-center font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`increase ${label}`}
        onClick={() => onChange(value + 1)}
        disabled={disabledInc}
        className="h-7 w-7 rounded-md border border-slate-200 bg-white text-base leading-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  </div>
)

const TransportCard: React.FC<{ t: CalendarTransport }> = ({ t }) => {
  const initials = t.operator
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sm font-bold text-sky-700">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {t.operator}
              {t.number && (
                <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700">
                  {t.number}
                </span>
              )}
            </div>
            {t.vehicle && <div className="text-xs text-slate-500">{t.vehicle}</div>}
          </div>
        </div>
        {t.recommended ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
            👍 Recommended
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
            Alternate
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <div>
          <div className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t.departTime}</div>
          <div className="text-xs text-slate-500">
            {[t.departCode, t.departCity].filter(Boolean).join(' • ')}
          </div>
        </div>
        <div className="flex flex-col items-center text-[11px] text-slate-500">
          <span>{t.duration}</span>
          <div className="my-1 h-px w-full bg-slate-300" />
          <span className="font-semibold text-emerald-600">{t.stops}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900 sm:text-2xl">{t.arriveTime}</div>
          <div className="text-xs text-slate-500">
            {[t.arriveCode, t.arriveCity].filter(Boolean).join(' • ')}
          </div>
        </div>
      </div>
    </div>
  )
}

export const DepartureCalendar: React.FC<Props> = ({
  destination,
  departures,
  transport,
  paymentsEnabled,
  initialPackageId,
}) => {
  // ---- package filter -----------------------------------------------------
  const packages = useMemo(() => {
    const m = new Map<string, { id: string; name: string; price: number; currency: string }>()
    departures.forEach((d) => {
      const cur = m.get(d.packageId)
      if (!cur || d.perPax < cur.price) {
        m.set(d.packageId, { id: d.packageId, name: d.packageName, price: d.perPax, currency: d.currency })
      }
    })
    return Array.from(m.values())
  }, [departures])

  const [packageFilter, setPackageFilter] = useState<string>(initialPackageId || 'all')

  const visible = useMemo(
    () => departures.filter((d) => packageFilter === 'all' || d.packageId === packageFilter),
    [departures, packageFilter],
  )

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarDeparture[]>()
    visible.forEach((d) => {
      const k = dayKey(d.startDate)
      m.set(k, [...(m.get(k) || []), d])
    })
    return m
  }, [visible])

  const startingPrice = useMemo(() => {
    const open = (visible.length ? visible : departures).filter((d) => !soldOut(d))
    const pool = open.length ? open : departures
    return pool.reduce((min, d) => Math.min(min, d.perPax), Infinity)
  }, [visible, departures])
  const startingCurrency = departures[0]?.currency || 'INR'

  // ---- month + selection --------------------------------------------------
  const firstKey = visible[0] ? dayKey(visible[0].startDate) : dayKey(departures[0].startDate)
  const [year, setYear] = useState(Number(firstKey.slice(0, 4)))
  const [month, setMonth] = useState(Number(firstKey.slice(5, 7)) - 1)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Resolve the selected departure against the *current* filter so a stale
  // selection never survives a filter change.
  const selected = useMemo(() => visible.find((d) => d.id === selectedId) || null, [visible, selectedId])

  const goMonth = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1))
    setYear(d.getUTCFullYear())
    setMonth(d.getUTCMonth())
  }

  const pickFilter = (id: string) => {
    setPackageFilter(id)
    setSelectedId(null)
    setSelectedDay(null)
    const next = departures.find((d) => id === 'all' || d.packageId === id)
    if (next) {
      setYear(Number(dayKey(next.startDate).slice(0, 4)))
      setMonth(Number(dayKey(next.startDate).slice(5, 7)) - 1)
    }
  }

  const pickDay = (key: string) => {
    const list = byDay.get(key) || []
    if (!list.length) return
    setSelectedDay(key)
    const open = list.filter((d) => !soldOut(d))
    // One bookable departure on that day → select it straight away.
    setSelectedId(open.length === 1 ? open[0].id : null)
  }

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const lead = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const dayList = selectedDay ? byDay.get(selectedDay) || [] : []
  // Until a date is chosen, show every upcoming departure in the viewed month.
  const monthPrefix = `${year}-${pad(month + 1)}`
  const listed = selectedDay
    ? dayList
    : visible.filter((d) => dayKey(d.startDate).startsWith(monthPrefix))

  // ---- traveller form -----------------------------------------------------
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'flight' | 'train'>(
    transport.some((t) => t.mode === 'flight') || !transport.length ? 'flight' : 'train',
  )

  const perPax = selected?.perPax ?? 0
  const currency = selected?.currency ?? startingCurrency
  const sym = symbolFor(currency)
  const payingPax = adults + children
  const total = perPax * payingPax
  const seatsLeft = selected?.seatsLeft
  const capReached = typeof seatsLeft === 'number' && payingPax + infants >= seatsLeft
  const overCap = typeof seatsLeft === 'number' && payingPax + infants > seatsLeft
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const phoneDigits = phone.replace(/\D/g, '')
  const contactValid =
    name.trim().length > 1 && emailValid && phoneDigits.length >= 7 && address.trim().length > 4
  const payable = paymentsEnabled && (selected?.acceptOnlinePayment ?? true)

  const missing = !selected
    ? 'Select a departure date to continue.'
    : !contactValid
      ? 'Enter your name, phone, a valid email and address to continue.'
      : null

  const shownTransport = transport.filter((t) => t.mode === tab)

  return (
    <div className="bg-slate-50 pb-16">
      {/* ---------------- Hero ---------------- */}
      <section
        className="relative isolate overflow-hidden bg-slate-900 text-white"
        style={
          destination.image
            ? { backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 pb-14 pt-28 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <nav className="mb-4 flex items-center gap-2 text-xs text-white/80">
              <Link href="/packages" className="hover:underline">
                Packages
              </Link>
              <span>›</span>
              <span className="font-semibold text-white">{destination.name}</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{destination.name}</h1>
            <p className="mt-3 max-w-xl text-base text-white/85 sm:text-lg">
              {destination.tagline ||
                `Pick a guaranteed group departure to ${destination.name}, check live seats and book in minutes.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                {packages.length} package{packages.length === 1 ? '' : 's'} available
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">Group Departure</span>
              {transport.length > 0 && (
                <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
                  Flights &amp; Trains Suggested
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Starting from</div>
            <div className="text-4xl font-extrabold">
              {sym}
              {Number.isFinite(startingPrice) ? startingPrice.toLocaleString('en-IN') : '—'}
            </div>
            <div className="text-xs text-slate-500">per person</div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 grid max-w-[1280px] gap-6 px-4 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* ---------------- Left column ---------------- */}
        <div className="space-y-6">
          {/* Calendar card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choose Your Departure Date</h2>
                <p className="text-sm text-slate-500">Select an available batch to join the group</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-2 py-1">
                <button type="button" aria-label="Previous month" onClick={() => goMonth(-1)} className="h-8 w-8 rounded-lg hover:bg-white">
                  ‹
                </button>
                <span className="min-w-[8.5rem] text-center text-sm font-bold text-slate-900">
                  {MONTHS[month]} {year}
                </span>
                <button type="button" aria-label="Next month" onClick={() => goMonth(1)} className="h-8 w-8 rounded-lg hover:bg-white">
                  ›
                </button>
              </div>
            </div>

            {/* Package filter */}
            {packages.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {[{ id: 'all', name: 'All packages' }, ...packages].map((p) => {
                  const active = packageFilter === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pickFilter(p.id)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 sm:gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className={i === 0 ? 'text-red-500' : ''}>
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e${i}`} />
                const key = keyOf(year, month, day)
                const list = byDay.get(key)
                if (!list) {
                  return (
                    <div key={key} className="flex h-12 items-center justify-center text-sm text-slate-700 sm:h-16">
                      {day}
                    </div>
                  )
                }
                const open = list.filter((d) => !soldOut(d))
                const isSold = open.length === 0
                const capped = open.filter((d) => d.seatsLeft !== null)
                const slots = capped.reduce((s, d) => s + (d.seatsLeft || 0), 0)
                const unlimited = open.some((d) => d.seatsLeft === null)
                const scarce = !unlimited && slots <= 5
                const active = selectedDay === key
                const tone = isSold
                  ? 'bg-red-50 text-red-700'
                  : scarce
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isSold}
                    onClick={() => pickDay(key)}
                    className={`flex h-12 flex-col items-center justify-center rounded-lg text-sm font-bold transition sm:h-16 ${tone} ${
                      active ? 'ring-2 ring-sky-600 ring-offset-1' : ''
                    } ${isSold ? 'cursor-not-allowed' : 'hover:brightness-95'}`}
                  >
                    <span className={isSold ? 'line-through' : ''}>{day}</span>
                    <span className="text-[9px] font-semibold leading-tight sm:text-[10px]">
                      {isSold ? 'Sold Out' : unlimited ? 'Open' : `${slots} Slot${slots === 1 ? '' : 's'}`}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Packages for the chosen date (or for the month in view) */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                {selectedDay
                  ? `Packages departing ${fmtLong(selectedDay)}`
                  : `Available packages in ${MONTHS[month]} ${year}`}
              </h3>
              {listed.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No departures this month — use the arrows to see other months.
                </p>
              ) : (
                <div className="grid gap-3">
                  {listed.map((d) => {
                    const active = d.id === selectedId
                    const out = soldOut(d)
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={out}
                        onClick={() => {
                          setSelectedId(d.id)
                          setSelectedDay(dayKey(d.startDate))
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:gap-4 sm:p-4 ${
                          active
                            ? 'border-sky-600 bg-sky-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        } ${out ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        {d.packageImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.packageImage} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-slate-900">{d.packageName}</div>
                          <div className="text-xs text-slate-500">
                            {fmtLong(d.startDate)}
                            {d.endDate ? ` → ${fmtLong(d.endDate)}` : ''}
                            {durationOf(d) ? ` · ${durationOf(d)}` : ''}
                            {d.label ? ` · ${d.label}` : ''}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {out ? (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">Sold Out</span>
                            ) : d.waitlist ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Waitlist</span>
                            ) : d.seatsLeft !== null ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                  d.seatsLeft <= 5 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {d.seatsLeft <= 5 ? `Only ${d.seatsLeft} seats left` : `${d.seatsLeft} slots left`}
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Seats available</span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-extrabold text-slate-900">
                            {symbolFor(d.currency)}
                            {d.perPax.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-500">per person</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected summary */}
            {selected && (
              <div className="mt-6 rounded-2xl bg-sky-50 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wide text-sky-700">
                    ● Selected departure summary
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    Guaranteed Slot
                  </span>
                </div>
                <div className="mt-3 text-sm font-bold text-slate-900">{selected.packageName}</div>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <div className="text-[11px] text-slate-500">Departure Date</div>
                    <div className="font-bold text-slate-900">{fmtLong(selected.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Return Date</div>
                    <div className="font-bold text-slate-900">{fmtLong(selected.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Duration</div>
                    <div className="font-bold text-slate-900">{durationOf(selected) || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Available Slots</div>
                    <div className="font-bold text-sky-700">
                      {selected.seatsLeft === null ? 'Open' : `${selected.seatsLeft} Seats`}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-sm text-slate-500">Locked Price Per Head:</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {sym}
                    {perPax.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Transport */}
          {transport.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recommended Transport</h2>
                  <p className="text-sm text-slate-500">Convenient connections aligning with batch timings</p>
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-700">
                  Suggested Options
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-sky-50 p-1">
                {(['flight', 'train'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTab(m)}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                      tab === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {m === 'flight' ? '✈ Flights' : '🚆 Trains'}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {shownTransport.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No {tab === 'flight' ? 'flight' : 'train'} suggestions for {destination.name} yet.
                  </p>
                ) : (
                  shownTransport.map((t) => <TransportCard key={t.id} t={t} />)
                )}
              </div>
            </section>
          )}
        </div>

        {/* ---------------- Right column: traveller form ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Traveller Information</h2>
            <p className="text-sm text-slate-500">Enter booking and contact details</p>

            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold text-slate-900">
                Full Name <span className="text-red-500">*</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-normal"
                  placeholder="Enter primary traveller's full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-900">
                Phone Number <span className="text-red-500">*</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-normal"
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-900">
                Email Address <span className="text-red-500">*</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-normal"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <div>
                <div className="mb-2 text-xs font-semibold text-slate-900">Passenger Count</div>
                <div className="grid grid-cols-3 gap-2">
                  <Stepper label="Adults" hint="12+ yrs" value={adults} min={1} onChange={setAdults} disabledInc={capReached} />
                  <Stepper label="Children" hint="2–11 yrs" value={children} min={0} onChange={setChildren} disabledInc={capReached} />
                  <Stepper label="Infants" hint="Under 2 yrs" value={infants} min={0} onChange={setInfants} disabledInc={capReached} />
                </div>
              </div>

              <label className="block text-xs font-semibold text-slate-900">
                Full Address <span className="text-red-500">*</span>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-normal"
                  placeholder="Enter your complete residential address (Street, City, State, PIN)…"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            </div>

            {selected && (
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="text-xs text-slate-500">
                  {payingPax} × {sym}
                  {perPax.toLocaleString('en-IN')}
                  {infants > 0 ? ` (+${infants} infant${infants === 1 ? '' : 's'} free)` : ''}
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {sym}
                  {total.toLocaleString('en-IN')}
                </div>
              </div>
            )}

            <div className="mt-5">
              <RazorpayCheckoutButton
                departureId={selected?.id || ''}
                travelers={{ adults, children, infants }}
                contact={{ name, email, phone }}
                address={address}
                disabled={!selected || !contactValid || total <= 0 || overCap}
                onError={(m) => setError(m)}
                className="w-full rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payable ? (
                  <>
                    Proceed to Pay {sym}
                    {total.toLocaleString('en-IN')}
                  </>
                ) : (
                  'Send Request'
                )}
              </RazorpayCheckoutButton>
            </div>

            {!payable && selected && (
              <p className="mt-2 text-xs text-slate-500">
                Online payment isn&apos;t enabled for this trip — we&apos;ll receive your details as an enquiry and
                contact you to confirm.
              </p>
            )}
            {missing && <p className="mt-2 text-xs text-slate-500">{missing}</p>}
            {overCap && <p className="mt-2 text-xs text-red-600">Only {seatsLeft} seats left for this departure.</p>}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <p className="mt-4 text-center text-[11px] text-slate-500">
              🔒 Instant confirmation • Official Indian Tourism Partner
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default DepartureCalendar
