'use client'

import React, { useMemo, useState } from 'react'
import { RazorpayCheckoutButton } from './RazorpayCheckoutButton'

const symbolFor = (c: string) =>
  c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : ''

export type DepartureOption = {
  id: string
  startDate?: string | null
  endDate?: string | null
  perPax: number
  currency: string
  seatsLeft?: number | null
  acceptOnlinePayment?: boolean
}

export type CheckoutFormProps = {
  packageName: string
  departures: DepartureOption[]
  // Whether the gateway is live (env + keys + admin toggle). Combined with the
  // departure's own toggle to decide "Pay" vs "Request Booking".
  paymentsEnabled?: boolean
}

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null

const Stepper: React.FC<{
  label: string
  hint?: string
  value: number
  min: number
  onChange: (n: number) => void
  disabledInc?: boolean
}> = ({ label, hint, value, min, onChange, disabledInc }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="font-medium">{label}</div>
      {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`decrease ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-8 w-8 rounded-full border text-lg leading-none disabled:opacity-40"
      >
        −
      </button>
      <span className="w-6 text-center tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`increase ${label}`}
        onClick={() => onChange(value + 1)}
        disabled={disabledInc}
        className="h-8 w-8 rounded-full border text-lg leading-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  </div>
)

/**
 * On-site checkout for a fixed departure. Price is per-pax (the package price),
 * so the total updates live as travellers change. Adults + children are charged;
 * infants are free. When the package has multiple departures, the customer picks one.
 */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({ packageName, departures, paymentsEnabled }) => {
  const [selectedId, setSelectedId] = useState(departures[0]?.id || '')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => departures.find((d) => d.id === selectedId) || departures[0],
    [departures, selectedId],
  )

  const perPax = selected?.perPax ?? 0
  const currency = selected?.currency ?? 'INR'
  const seatsLeft = selected?.seatsLeft
  const payingPax = adults + children
  const total = perPax * payingPax
  const sym = symbolFor(currency)

  const capReached =
    typeof seatsLeft === 'number' && seatsLeft >= 0 && payingPax + infants >= seatsLeft
  const overCap = typeof seatsLeft === 'number' && seatsLeft >= 0 && payingPax + infants > seatsLeft
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const contactValid = name.trim().length > 1 && emailValid && phone.trim().length >= 7
  // Whether this specific departure can be paid online right now.
  const payable = Boolean(paymentsEnabled) && (selected?.acceptOnlinePayment ?? true)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Book: {packageName}</h1>

      {departures.length > 1 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium">Choose a departure</div>
          <div className="grid gap-2">
            {departures.map((d) => {
              const active = d.id === selected?.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    active ? 'border-[#FBAE3D] bg-[#FBAE3D]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">
                    {[fmtDate(d.startDate), fmtDate(d.endDate)].filter(Boolean).join(' → ') || 'Flexible dates'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {symbolFor(d.currency)}
                    {d.perPax.toLocaleString('en-IN')}/pax
                    {typeof d.seatsLeft === 'number' ? ` · ${d.seatsLeft} left` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {departures.length === 1 && (
        <p className="mt-1 text-muted-foreground">
          {[fmtDate(selected?.startDate), fmtDate(selected?.endDate)].filter(Boolean).join(' → ') || 'Flexible dates'}
          {typeof seatsLeft === 'number' ? ` · ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left` : ''}
        </p>
      )}

      <div className="mt-6 rounded-xl border p-5">
        <div className="mb-2 text-sm text-muted-foreground">
          {sym}
          {perPax.toLocaleString('en-IN')} per person
        </div>
        <div className="divide-y">
          <Stepper label="Adults" value={adults} min={1} onChange={setAdults} disabledInc={capReached} />
          <Stepper label="Children" hint="Charged at full price" value={children} min={0} onChange={setChildren} disabledInc={capReached} />
          <Stepper label="Infants" hint="Free" value={infants} min={0} onChange={setInfants} disabledInc={capReached} />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="text-sm font-medium">Your details</div>
        <input className="rounded-lg border px-4 py-3" placeholder="Full name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-lg border px-4 py-3" placeholder="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded-lg border px-4 py-3" placeholder="Phone *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea
          className="rounded-lg border px-4 py-3"
          rows={3}
          placeholder="Special requests (optional) — dietary needs, room preferences, etc."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-black/5 p-5">
        <div>
          <div className="text-sm text-muted-foreground">
            {payingPax} × {sym}
            {perPax.toLocaleString('en-IN')}
            {infants > 0 ? ` (+${infants} infant${infants === 1 ? '' : 's'} free)` : ''}
          </div>
          <div className="text-2xl font-bold">
            {sym}
            {total.toLocaleString('en-IN')}
          </div>
        </div>
        <RazorpayCheckoutButton
          departureId={selected?.id || ''}
          travelers={{ adults, children, infants }}
          contact={{ name, email, phone }}
          specialRequests={specialRequests}
          disabled={!selected || !contactValid || total <= 0 || overCap}
          onError={(m) => setError(m)}
        >
          {payable ? (
            <>
              Pay {sym}
              {total.toLocaleString('en-IN')}
            </>
          ) : (
            'Request Booking'
          )}
        </RazorpayCheckoutButton>
      </div>
      {!payable && (
        <p className="mt-2 text-sm text-muted-foreground">
          Online payment isn&apos;t enabled for this departure — we&apos;ll take your request and contact you to confirm.
        </p>
      )}

      {!contactValid && <p className="mt-2 text-sm text-muted-foreground">Enter name, a valid email, and phone to continue.</p>}
      {overCap && <p className="mt-2 text-sm text-red-600">Only {seatsLeft} seats left for this departure.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default CheckoutForm
