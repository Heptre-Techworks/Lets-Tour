import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CheckoutForm } from '@/components/Payments/CheckoutForm'

export const dynamic = 'force-dynamic'

// On-site checkout page for a FIXED departure: /booking/checkout?departure=<id>
// The departure references an existing package in the DB; price is per-pax.
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ departure?: string }>
}) {
  const { departure: departureId } = await searchParams

  const notFound = (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Departure not available</h1>
      <p className="mt-2 text-muted-foreground">This departure link is invalid or no longer bookable.</p>
      <Link href="/packages" className="mt-6 inline-block font-semibold text-[#FBAE3D]">
        Browse packages →
      </Link>
    </div>
  )

  if (!departureId) return notFound

  const payload = await getPayload({ config: configPromise })
  const departure = (await payload
    .findByID({ collection: 'package-departures', id: departureId, depth: 1, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null

  if (!departure) return notFound

  const pkg = typeof departure.package === 'object' ? departure.package : null
  if (!pkg) return notFound
  if (['closed', 'cancelled', 'departed'].includes(departure.status)) return notFound

  const perPax = departure.priceOverride ?? pkg.price ?? 0
  const currency = departure.currency || pkg.currency || 'INR'
  const seatsLeft =
    typeof departure.capacity === 'number'
      ? Math.max(0, departure.capacity - (departure.seatsBooked || 0))
      : null

  return (
    <CheckoutForm
      departureId={String(departure.id)}
      packageName={pkg.name || 'Package'}
      perPax={perPax}
      currency={currency}
      startDate={departure.startDate}
      endDate={departure.endDate}
      seatsLeft={seatsLeft}
    />
  )
}
