import { NextResponse } from 'next/server'
import type { Payload, Where } from 'payload'
import { getPayloadClient } from '@/lib/razorpay/helpers'
import { verifyWebhookSignature } from '@/lib/razorpay/client'
import { reconcilePayment } from '@/lib/razorpay/reconcilePayment'

export const dynamic = 'force-dynamic'

// Find a booking by one of the Razorpay reference fields.
async function findBooking(
  payload: Payload,
  where: Where,
): Promise<Record<string, any> | null> {
  const res = await payload.find({ collection: 'bookings', where, limit: 1, overrideAccess: true })
  return (res.docs[0] as Record<string, any>) || null
}

/**
 * Razorpay webhook. Verifies the signature over the RAW body, then reconciles the
 * payment onto the matching booking. Idempotent (see reconcilePayment). Always
 * returns 200 quickly on handled/duplicate events so Razorpay stops retrying.
 */
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  try {
    const type: string = event?.event
    const paymentEntity = event?.payload?.payment?.entity
    const linkEntity = event?.payload?.payment_link?.entity

    if (type === 'payment_link.paid') {
      const referenceId = linkEntity?.reference_id
      const linkId = linkEntity?.id
      const booking =
        (referenceId && (await findBooking(payload, { bookingReference: { equals: referenceId } }))) ||
        (linkId && (await findBooking(payload, { razorpayPaymentLinkId: { equals: linkId } })))
      if (booking && paymentEntity) {
        await reconcilePayment(payload, {
          bookingId: String(booking.id),
          paidAmountPaise: Number(paymentEntity.amount) || 0,
          razorpayPaymentId: paymentEntity.id,
          paymentLinkId: linkId,
          event: type,
        })
      } else {
        payload.logger.warn(`razorpay webhook ${type}: no booking for reference ${referenceId}`)
      }
    } else if (type === 'payment.captured') {
      const orderId = paymentEntity?.order_id
      const booking = orderId && (await findBooking(payload, { razorpayOrderId: { equals: orderId } }))
      if (booking && paymentEntity) {
        await reconcilePayment(payload, {
          bookingId: String(booking.id),
          paidAmountPaise: Number(paymentEntity.amount) || 0,
          razorpayPaymentId: paymentEntity.id,
          orderId,
          event: type,
        })
      } else {
        payload.logger.warn(`razorpay webhook ${type}: no booking for order ${orderId}`)
      }
    }
    // Other events (payment.failed, refund.processed, …) are acknowledged and ignored for now.
  } catch (e) {
    // Log but still return 200 — idempotency makes retries safe, and we don't want
    // Razorpay hammering the endpoint on transient errors.
    payload.logger.error(`razorpay webhook handler error: ${e}`)
  }

  return NextResponse.json({ received: true })
}
