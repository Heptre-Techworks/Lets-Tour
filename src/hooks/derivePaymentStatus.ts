import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Keeps `paymentStatus` in sync with the money actually collected.
 *
 * This is the seam the Razorpay webhook / on-site checkout rely on: server code
 * only has to write `paidAmount`, and this hook derives the status.
 *
 *  - paidAmount >= totalPrice (and totalPrice > 0) → 'completed'
 *  - paidAmount > 0                                → 'partial'
 *  - otherwise                                     → 'pending'
 *
 * A manual 'refunded' status is never overwritten.
 */
export const derivePaymentStatus: CollectionBeforeChangeHook = async ({ data }) => {
  if (!data) return data
  if (data.paymentStatus === 'refunded') return data

  const total = typeof data.totalPrice === 'number' ? data.totalPrice : 0
  const paid = typeof data.paidAmount === 'number' ? data.paidAmount : 0

  if (total > 0 && paid >= total) {
    data.paymentStatus = 'completed'
  } else if (paid > 0) {
    data.paymentStatus = 'partial'
  } else {
    data.paymentStatus = 'pending'
  }

  return data
}
