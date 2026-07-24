import { NextResponse } from 'next/server'
import { getPayloadClient, resolveProductAccept } from '@/lib/razorpay/helpers'
import { createOrder, getPaymentSettings, isPaymentsEnabled } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

/**
 * On-site Checkout entry point for a FIXED departure. The customer picks an
 * existing `package-departures` record (which references a real package); we
 * create a pending booking + a Razorpay Order, and return the order to the
 * browser to open Razorpay Checkout.
 *
 * Expected body: { departureId, adults, children?, infants?, contact:{name,email,phone}, specialRequests? }
 */
export async function POST(req: Request) {
  const payload = await getPayloadClient()

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const departureId = body?.departureId
  if (!departureId) return NextResponse.json({ error: 'departureId is required' }, { status: 400 })

  const settings = await getPaymentSettings(payload)
  if (!isPaymentsEnabled(settings)) {
    return NextResponse.json({ error: 'Online payments are currently disabled.' }, { status: 400 })
  }

  // Load the existing departure (tied to a real package).
  const departure = (await payload
    .findByID({ collection: 'package-departures', id: departureId, depth: 1, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null
  if (!departure) return NextResponse.json({ error: 'Departure not found' }, { status: 404 })

  const pkg = typeof departure.package === 'object' ? departure.package : null
  const packageId = pkg?.id ?? departure.package
  if (!packageId) return NextResponse.json({ error: 'Departure is not linked to a package' }, { status: 400 })

  const accept = resolveProductAccept({
    departureAccept: departure.acceptOnlinePayment,
    packageDefault: pkg?.defaultAcceptOnlinePayment,
  })
  if (!accept) {
    return NextResponse.json({ error: 'Online payment is disabled for this departure.' }, { status: 400 })
  }

  if (departure.status && ['closed', 'cancelled', 'departed'].includes(departure.status)) {
    return NextResponse.json({ error: `Departure is ${departure.status}.` }, { status: 400 })
  }

  const adults = Math.max(1, Number(body.adults) || 1)
  const children = Math.max(0, Number(body.children) || 0)
  const infants = Math.max(0, Number(body.infants) || 0)
  const payingHeads = adults + children // infants free

  const unitPrice = departure.priceOverride ?? pkg?.price ?? 0
  const total = unitPrice * payingHeads
  if (total <= 0) return NextResponse.json({ error: 'Unable to price this departure.' }, { status: 400 })

  const currency = departure.currency || pkg?.currency || settings.defaultCurrency || 'INR'
  const amountPaise = Math.round(total * 100)

  const contact = body.contact || {}

  // Create the pending booking first so we have a bookingReference for the receipt.
  // `bookingReference` is required by the type but is generated in the collection's
  // beforeChange hook, so the data object is cast here.
  const booking = await payload.create({
    collection: 'bookings',
    overrideAccess: true,
    data: {
      package: packageId,
      packageDeparture: departureId,
      startDate: departure.startDate,
      endDate: departure.endDate,
      numberOfPeople: { adults, children, infants },
      totalPrice: total,
      paidAmount: 0,
      currency,
      status: 'pending',
      guestName: contact.name,
      guestEmail: contact.email,
      guestPhone: contact.phone,
      contactDetails: { phone: contact.phone || '', email: contact.email || '' },
      specialRequests: body.specialRequests,
    } as any,
  })

  try {
    const order = await createOrder({
      amountPaise,
      currency,
      receipt: booking.bookingReference as string,
      notes: { bookingId: String(booking.id), departureId: String(departureId) },
    })

    await payload.update({
      collection: 'bookings',
      id: booking.id,
      overrideAccess: true,
      data: { razorpayOrderId: order.id },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: amountPaise,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create order' },
      { status: 502 },
    )
  }
}
