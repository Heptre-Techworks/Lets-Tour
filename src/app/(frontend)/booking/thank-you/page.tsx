import React from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Landing page after a successful Razorpay Checkout / payment-link payment.
export default async function BookingThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FBAE3D]/15 text-3xl">
        ✓
      </div>
      <h1 className="mb-2 text-3xl font-bold">Payment received</h1>
      <p className="mb-6 text-muted-foreground">
        Thank you — your booking is confirmed{ref ? <> under reference <strong>{ref}</strong></> : ''}.
        Our team will be in touch shortly with the details.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-[#FBAE3D] px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
