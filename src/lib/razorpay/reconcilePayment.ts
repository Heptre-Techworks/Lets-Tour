import type { Payload } from 'payload'

type PaymentEvent = {
  event: string
  at: string
  razorpayPaymentId?: string
  amount?: number
}

export type ReconcileArgs = {
  bookingId: string
  /** Amount captured in this event, in integer paise. */
  paidAmountPaise: number
  razorpayPaymentId?: string
  event: string
  orderId?: string
  paymentLinkId?: string
  signature?: string
}

export type ReconcileResult = { updated: boolean; reason?: 'not_found' | 'duplicate'; paidAmount?: number }

/**
 * Apply a confirmed payment to a booking. Shared by the webhook and the on-site
 * Checkout verify route.
 *
 * Idempotent: a given `razorpayPaymentId` is applied at most once (guarded by the
 * booking's `paymentEvents` log), so Razorpay's webhook retries and the
 * webhook/verify double-signal are safe. Writing `paidAmount` lets the Bookings
 * `derivePaymentStatus` beforeChange hook flip `paymentStatus`.
 */
export async function reconcilePayment(payload: Payload, args: ReconcileArgs): Promise<ReconcileResult> {
  const booking = (await payload
    .findByID({ collection: 'bookings', id: args.bookingId, depth: 0, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null

  if (!booking) return { updated: false, reason: 'not_found' }

  const events: PaymentEvent[] = Array.isArray(booking.paymentEvents) ? booking.paymentEvents : []

  // Idempotency: skip if we've already recorded this payment id.
  if (args.razorpayPaymentId && events.some((e) => e.razorpayPaymentId === args.razorpayPaymentId)) {
    return { updated: false, reason: 'duplicate', paidAmount: booking.paidAmount ?? 0 }
  }

  const addAmount = args.paidAmountPaise / 100
  const newPaid = (typeof booking.paidAmount === 'number' ? booking.paidAmount : 0) + addAmount

  await payload.update({
    collection: 'bookings',
    id: args.bookingId,
    overrideAccess: true,
    data: {
      paidAmount: newPaid,
      razorpayPaymentId: args.razorpayPaymentId ?? booking.razorpayPaymentId,
      razorpayOrderId: args.orderId ?? booking.razorpayOrderId,
      razorpayPaymentLinkId: args.paymentLinkId ?? booking.razorpayPaymentLinkId,
      razorpaySignature: args.signature ?? booking.razorpaySignature,
      paymentVerified: true,
      paymentEvents: [
        ...events,
        {
          event: args.event,
          at: new Date().toISOString(),
          razorpayPaymentId: args.razorpayPaymentId,
          amount: addAmount,
        },
      ],
      // paymentStatus is derived by the derivePaymentStatus beforeChange hook.
    },
  })

  return { updated: true, paidAmount: newPaid }
}
