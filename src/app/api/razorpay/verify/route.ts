import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/razorpay/helpers'
import { verifyPaymentSignature } from '@/lib/razorpay/client'
import { reconcilePayment } from '@/lib/razorpay/reconcilePayment'

export const dynamic = 'force-dynamic'

/**
 * On-site Checkout success handler. The browser posts the Razorpay Checkout
 * result here; we verify the signature, reconcile the payment, and confirm the
 * booking. The webhook remains the source of truth — this just gives instant UX.
 *
 * Expected body: { orderId, paymentId, signature, bookingId }
 */
export async function POST(req: Request) {
  const payload = await getPayloadClient()

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { orderId, paymentId, signature, bookingId } = body || {}
  if (!orderId || !paymentId || !signature || !bookingId) {
    return NextResponse.json({ error: 'orderId, paymentId, signature and bookingId are required' }, { status: 400 })
  }

  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
  }

  const booking = (await payload
    .findByID({ collection: 'bookings', id: bookingId, depth: 0, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Guard: the order must belong to this booking.
  if (booking.razorpayOrderId && booking.razorpayOrderId !== orderId) {
    return NextResponse.json({ error: 'Order does not match booking' }, { status: 400 })
  }

  const total = typeof booking.totalPrice === 'number' ? booking.totalPrice : 0
  const paid = typeof booking.paidAmount === 'number' ? booking.paidAmount : 0
  const duePaise = Math.round(Math.max(0, total - paid) * 100)

  const result = await reconcilePayment(payload, {
    bookingId,
    paidAmountPaise: duePaise,
    razorpayPaymentId: paymentId,
    orderId,
    signature,
    event: 'checkout.verified',
  })

  // Confirm the booking on first successful verification.
  if (result.updated) {
    await payload.update({
      collection: 'bookings',
      id: bookingId,
      overrideAccess: true,
      data: { status: 'confirmed' },
    })
  }

  return NextResponse.json({ success: true, bookingReference: booking.bookingReference })
}
