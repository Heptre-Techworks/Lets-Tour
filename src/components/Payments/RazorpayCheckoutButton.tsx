'use client'

import React, { useCallback, useState } from 'react'
import { getCheckoutBranding, RAZORPAY_CHECKOUT_SRC } from '@/lib/razorpay/checkoutConfig'

declare global {
  interface Window {
    Razorpay?: any
  }
}

type Contact = { name?: string; email?: string; phone?: string }

export type RazorpayCheckoutButtonProps = {
  /** Existing package-departures record id (tied to a real package in the DB). */
  departureId: string
  travelers: { adults: number; children?: number; infants?: number }
  contact: Contact
  specialRequests?: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: (bookingReference: string) => void
  onError?: (message: string) => void
}

// Loads the Razorpay Checkout script once.
const loadCheckoutScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.Razorpay) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }
    const s = document.createElement('script')
    s.src = RAZORPAY_CHECKOUT_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(s)
  })

/**
 * Drop-in "Pay & Book" button for a FIXED departure. Creates a Razorpay Order via
 * the server route, opens Razorpay Checkout with the site branding, then verifies
 * the payment server-side and redirects to the thank-you page.
 */
export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  departureId,
  travelers,
  contact,
  specialRequests,
  className,
  children,
  disabled,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false)
  const branding = getCheckoutBranding()

  const fail = useCallback(
    (msg: string) => {
      setLoading(false)
      onError?.(msg)
    },
    [onError],
  )

  const handleClick = useCallback(async () => {
    setLoading(true)
    try {
      // 1) Create the order + pending booking (server derives price from the DB).
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureId,
          adults: travelers.adults,
          children: travelers.children || 0,
          infants: travelers.infants || 0,
          contact,
          specialRequests,
        }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) return fail(order?.error || 'Could not start payment')

      // Lead captured but online payment isn't available for this departure —
      // treat it as a booking request and send the customer to the confirmation.
      if (order.payable === false) {
        onSuccess?.(order.bookingReference)
        window.location.href = `/booking/thank-you?ref=${encodeURIComponent(order.bookingReference)}&status=received`
        return
      }

      // 2) Open Razorpay Checkout.
      await loadCheckoutScript()
      if (!window.Razorpay) return fail('Razorpay failed to load')

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: branding.name,
        description: `Booking ${order.bookingReference}`,
        image: branding.logo || undefined,
        prefill: { name: contact.name, email: contact.email, contact: contact.phone },
        notes: { bookingId: order.bookingId, bookingReference: order.bookingReference },
        theme: { color: branding.themeColor },
        handler: async (response: any) => {
          // 3) Verify server-side, then confirm.
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: order.bookingId,
              }),
            })
            const verify = await verifyRes.json()
            if (!verifyRes.ok) return fail(verify?.error || 'Payment verification failed')
            onSuccess?.(order.bookingReference)
            window.location.href = `/booking/thank-you?ref=${encodeURIComponent(order.bookingReference)}`
          } catch {
            fail('Payment verification failed')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.on('payment.failed', (resp: any) => fail(resp?.error?.description || 'Payment failed'))
      rzp.open()
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Something went wrong')
    }
  }, [departureId, travelers, contact, specialRequests, branding, fail, onSuccess])

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        className ||
        'inline-flex items-center justify-center rounded-lg bg-[#FBAE3D] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {loading ? 'Processing…' : children || 'Pay & Book'}
    </button>
  )
}

export default RazorpayCheckoutButton
