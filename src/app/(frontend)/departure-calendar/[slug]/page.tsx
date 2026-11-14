import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DepartureCalendar } from '@/components/DepartureCalendar'
import type {
  CalendarDeparture,
  CalendarTransport,
  CalendarDestination,
} from '@/components/DepartureCalendar'
import { getPaymentSettings, isPaymentsEnabled } from '@/lib/razorpay/client'
import { getMediaUrl } from '@/utilities/getMediaUrl'

// Always fresh: slots, prices and the payment toggle all come straight from the
// Payload admin (Package Departures / Packages / Destinations / Payment Settings).
export const dynamic = 'force-dynamic'

const BOOKABLE = ['open', 'waitlist']

const mediaUrl = (m: any): string | null =>
  m && typeof m === 'object' && m.url ? getMediaUrl(m.url, m.updatedAt) : null

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ package?: string }>
}

export async function generateMetadata({ params }: Args) {
  const { slug } = await params
  return { title: `Departure Calendar — ${slug.replace(/-/g, ' ')} | Let's Tour` }
}

/**
 * Departure Calendar for ONE destination. Lists every bookable fixed departure of the
 * published packages that include this destination, with live seat counts, suggested
 * flights/trains, the traveller form and the Razorpay-or-enquiry submit.
 */
export default async function DepartureCalendarPage({ params, searchParams }: Args) {
  const { slug } = await params
  const { package: preselectPackage } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const destRes = await payload.find({
    collection: 'destinations',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const dest = destRes.docs[0] as any
  if (!dest) notFound()

  const settings = await getPaymentSettings(payload)
  const paymentsEnabled = isPaymentsEnabled(settings)

  // Published FIXED-departure packages that include this destination.
  const pkgRes = await payload.find({
    collection: 'packages',
    where: {
      and: [
        { destinations: { in: [dest.id] } },
        { scheduleType: { equals: 'fixed' } },
        { isPublished: { equals: true } },
      ],
    },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  const packages = pkgRes.docs as any[]
  const pkgById = new Map(packages.map((p) => [String(p.id), p]))

  let departures: CalendarDeparture[] = []
  if (packages.length) {
    const depRes = await payload.find({
      collection: 'package-departures',
      where: {
        and: [
          { package: { in: packages.map((p) => p.id) } },
          { status: { in: BOOKABLE } },
        ],
      },
      sort: 'startDate',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })
    const cutoff = Date.now() - 86_400_000
    departures = depRes.docs
      .filter((d: any) => d.startDate && new Date(d.startDate).getTime() >= cutoff)
      .map((d: any): CalendarDeparture => {
        const pkg = pkgById.get(String(typeof d.package === 'object' ? d.package?.id : d.package))
        return {
          id: String(d.id),
          packageId: String(pkg?.id),
          packageName: pkg?.name || 'Package',
          packageSlug: pkg?.slug || null,
          packageImage: mediaUrl(pkg?.heroImage),
          duration: pkg?.duration || null,
          tagline: pkg?.tagline || null,
          label: d.label || null,
          startDate: d.startDate,
          endDate: d.endDate ?? null,
          perPax: d.priceOverride ?? pkg?.price ?? 0,
          currency: d.currency ?? pkg?.currency ?? 'INR',
          seatsLeft:
            typeof d.capacity === 'number' ? Math.max(0, d.capacity - (d.seatsBooked || 0)) : null,
          waitlist: d.status === 'waitlist',
          acceptOnlinePayment: d.acceptOnlinePayment ?? pkg?.defaultAcceptOnlinePayment ?? true,
        }
      })
      .filter((d) => d.packageId !== 'undefined')
  }

  const transport: CalendarTransport[] = ((dest.suggestedTransport as any[]) || []).map((t, i) => ({
    id: String(t.id ?? i),
    mode: t.mode === 'train' ? 'train' : 'flight',
    operator: t.operator || '',
    number: t.number || null,
    vehicle: t.vehicle || null,
    departTime: t.departTime || '',
    departCode: t.departCode || null,
    departCity: t.departCity || '',
    arriveTime: t.arriveTime || '',
    arriveCode: t.arriveCode || null,
    arriveCity: t.arriveCity || '',
    duration: t.duration || null,
    stops: t.stops || null,
    recommended: Boolean(t.recommended),
  }))

  const destination: CalendarDestination = {
    name: dest.name,
    slug: dest.slug,
    image: mediaUrl(dest.coverImage) || mediaUrl(dest.featuredImage),
    tagline: dest.heroData?.tagline || null,
  }

  if (departures.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">{dest.name} — Departure Calendar</h1>
        <p className="mt-3 text-muted-foreground">
          There are no scheduled departures open for {dest.name} right now. Please check back soon or
          plan a custom trip with us.
        </p>
        <Link href={`/destinations/${dest.slug}`} className="mt-6 inline-block font-semibold text-[#FBAE3D]">
          ← Back to {dest.name}
        </Link>
      </div>
    )
  }

  return (
    <DepartureCalendar
      destination={destination}
      departures={departures}
      transport={transport}
      paymentsEnabled={paymentsEnabled}
      initialPackageId={preselectPackage && pkgById.has(String(preselectPackage)) ? String(preselectPackage) : null}
    />
  )
}
