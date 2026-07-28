import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CheckoutForm, type DepartureOption } from '@/components/Payments/CheckoutForm'
import { getPaymentSettings, isPaymentsEnabled } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

const BOOKABLE = ['open', 'waitlist']

// On-site checkout. Accepts either:
//   /booking/checkout?departure=<id>   → a specific departure
//   /booking/checkout?package=<id>     → pick from the package's bookable departures
// Everything references existing records in the DB; price is per-pax.
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ departure?: string; package?: string }>
}) {
  const { departure: departureId, package: packageId } = await searchParams

  const shell = (title: string, body: React.ReactNode) => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-2 text-muted-foreground">{body}</div>
      <Link href="/packages" className="mt-6 inline-block font-semibold text-[#FBAE3D]">
        Browse packages →
      </Link>
    </div>
  )

  if (!departureId && !packageId) {
    return shell('Nothing to book', 'No package or departure was specified.')
  }

  const payload = await getPayload({ config: configPromise })

  const toOption = (dep: any, pkg: any): DepartureOption => ({
    id: String(dep.id),
    startDate: dep.startDate ?? null,
    endDate: dep.endDate ?? null,
    perPax: dep.priceOverride ?? pkg?.price ?? 0,
    currency: dep.currency ?? pkg?.currency ?? 'INR',
    seatsLeft:
      typeof dep.capacity === 'number' ? Math.max(0, dep.capacity - (dep.seatsBooked || 0)) : null,
    acceptOnlinePayment: dep.acceptOnlinePayment ?? pkg?.defaultAcceptOnlinePayment ?? true,
  })

  const settings = await getPaymentSettings(payload)
  const paymentsEnabled = isPaymentsEnabled(settings)

  let packageName = 'Package'
  let options: DepartureOption[] = []

  if (departureId) {
    const dep = (await payload
      .findByID({ collection: 'package-departures', id: departureId, depth: 1, overrideAccess: true })
      .catch(() => null)) as any
    if (!dep) return shell('Departure not available', 'This departure link is invalid or no longer bookable.')
    const pkg = typeof dep.package === 'object' ? dep.package : null
    if (!pkg) return shell('Departure not available', 'This departure is not linked to a package.')
    if (!BOOKABLE.includes(dep.status)) return shell('Departure not available', 'This departure is no longer open for booking.')
    packageName = pkg.name || packageName
    options = [toOption(dep, pkg)]
  } else if (packageId) {
    const pkg = (await payload
      .findByID({ collection: 'packages', id: packageId, depth: 0, overrideAccess: true })
      .catch(() => null)) as any
    if (!pkg) return shell('Package not found', 'This package is unavailable.')
    packageName = pkg.name || packageName

    const res = await payload.find({
      collection: 'package-departures',
      where: { and: [{ package: { equals: packageId } }, { status: { in: BOOKABLE } }] },
      sort: 'startDate',
      depth: 0,
      limit: 100,
      overrideAccess: true,
    })
    const cutoff = Date.now() - 86400000
    options = res.docs
      .filter((d: any) => !d.startDate || new Date(d.startDate).getTime() >= cutoff)
      .map((d: any) => toOption(d, pkg))
  }

  if (options.length === 0) {
    return shell(
      'No scheduled departures',
      <>There are no open departures for {packageName} right now. Please use “Book now” on the package page to send an enquiry.</>,
    )
  }

  return <CheckoutForm packageName={packageName} departures={options} paymentsEnabled={paymentsEnabled} />
}
