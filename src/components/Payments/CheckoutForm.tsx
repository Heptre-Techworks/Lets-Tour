'use client'

import React, { useMemo, useState } from 'react'
import { RazorpayCheckoutButton } from './RazorpayCheckoutButton'

const symbolFor = (c: string) =>
  c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : ''

export type CheckoutFormProps = {
  departureId: string
  packageName: string
  perPax: number
  currency: string
  startDate?: string | null
  endDate?: string | null
  seatsLeft?: number | null
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
 * infants are free.
 */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  departureId,
  packageName,
  perPax,
  currency,
  startDate,
  endDate,
  seatsLeft,
}) => {
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const payingPax = adults + children
  const total = perPax * payingPax
  const sym = symbolFor(currency)

  const capReached = useMemo(
    () => typeof seatsLeft === 'number' && seatsLeft >= 0 && payingPax + infants >= seatsLeft,
    [seatsLeft, payingPax, infants],
  )

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const contactValid = name.trim().length > 1 && emailValid && phone.trim().length >= 7
  const overCap = typeof seatsLeft === 'number' && seatsLeft >= 0 && payingPax + infants > seatsLeft

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Book: {packageName}</h1>
      <p className="mt-1 text-muted-foreground">
        {[fmtDate(startDate), fmtDate(endDate)].filter(Boolean).join(' → ') || 'Flexible dates'}
        {typeof seatsLeft === 'number' && seatsLeft >= 0 ? ` · ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left` : ''}
      </p>

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
        <input className="rounded-lg border px-4 py-3" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-lg border px-4 py-3" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded-lg border px-4 py-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
          departureId={departureId}
          travelers={{ adults, children, infants }}
          contact={{ name, email, phone }}
          disabled={!contactValid || total <= 0 || overCap}
          onError={(m) => setError(m)}
        >
          Pay {sym}
          {total.toLocaleString('en-IN')}
        </RazorpayCheckoutButton>
      </div>

      {!contactValid && <p className="mt-2 text-sm text-muted-foreground">Enter name, a valid email, and phone to continue.</p>}
      {overCap && <p className="mt-2 text-sm text-red-600">Only {seatsLeft} seats left for this departure.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default CheckoutForm
