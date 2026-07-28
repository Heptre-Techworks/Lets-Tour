import { NextResponse } from 'next/server'
import { getPayloadClient, resolveProductAccept } from '@/lib/razorpay/helpers'
import { createOrder, getPaymentSettings, isPaymentsEnabled } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

/**
 * Checkout entry point for a FIXED departure. This is the LEAD-COLLECTION step for
 * PG-eligible packages: it always creates a pending booking (the lead, tied to the
 * real package + departure, and firing the lead-notification email), THEN layers a
 * Razorpay Order on top only when online payment is actually available. That way the
 * lead is captured on the checkout page whether or not the customer pays.
 *
 * Expected body: { departureId, adults, children?, infants?, contact:{name,email,phone}, specialRequests? }
 * Returns: { payable: true, orderId, amount, currency, keyId, bookingId, bookingReference }
 *       or { payable: false, bookingId, bookingReference }  (lead captured, no payment)
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

  // Load the existing departure (tied to a real package).
  const departure = (await payload
    .findByID({ collection: 'package-departures', id: departureId, depth: 1, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null
  if (!departure) return NextResponse.json({ error: 'Departure not found' }, { status: 404 })

  const pkg = typeof departure.package === 'object' ? departure.package : null
  const packageId = pkg?.id ?? departure.package
  if (!packageId) return NextResponse.json({ error: 'Departure is not linked to a package' }, { status: 400 })

  if (departure.status && ['closed', 'cancelled', 'departed'].includes(departure.status)) {
    return NextResponse.json({ error: `Departure is ${departure.status}.` }, { status: 400 })
  }

  const adults = Math.max(1, Number(body.adults) || 1)
  const children = Math.max(0, Number(body.children) || 0)
  const infants = Math.max(0, Number(body.infants) || 0)
  const payingHeads = adults + children // infants free

  const settings = await getPaymentSettings(payload)
  const unitPrice = departure.priceOverride ?? pkg?.price ?? 0
  const total = unitPrice * payingHeads
  if (total <= 0) return NextResponse.json({ error: 'Unable to price this departure.' }, { status: 400 })

  const currency = departure.currency || pkg?.currency || settings.defaultCurrency || 'INR'
  const amountPaise = Math.round(total * 100)
  const contact = body.contact || {}

  // 1) LEAD COLLECTION — always create the pending booking (fires sendLeadEmail).
  // `bookingReference` is generated in the collection's beforeChange hook.
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

  // 2) PAYMENT — only when the gateway is enabled AND this product accepts online payment.
  const payable =
    isPaymentsEnabled(settings) &&
    resolveProductAccept({
      departureAccept: departure.acceptOnlinePayment,
      packageDefault: pkg?.defaultAcceptOnlinePayment,
    })

  if (!payable) {
    return NextResponse.json({
      payable: false,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
    })
  }

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
      payable: true,
      orderId: order.id,
      amount: amountPaise,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
    })
  } catch (e) {
    // The lead is already captured; surface the payment error so the user can retry.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create order', bookingId: booking.id },
      { status: 502 },
    )
  }
}
