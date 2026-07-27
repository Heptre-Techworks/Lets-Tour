import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayloadClient, resolveProductAccept } from '@/lib/razorpay/helpers'
import { createPaymentLink, getPaymentSettings, isPaymentsEnabled } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

/**
 * Admin-initiated Razorpay Payment Link for a booking (the custom / unscheduled
 * flow: talk to the customer, then send a link). Always operates on an existing
 * booking that is tied to a real package in the DB.
 */
export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let bookingId: string | undefined
  try {
    const body = await req.json()
    bookingId = body?.bookingId
  } catch {
    /* ignore */
  }
  if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })

  const settings = await getPaymentSettings(payload)
  if (!isPaymentsEnabled(settings)) {
    return NextResponse.json(
      { error: 'Online payments are disabled (check PAYMENTS_ENABLED, keys, and Payment Settings).' },
      { status: 400 },
    )
  }

  const booking = (await payload
    .findByID({ collection: 'bookings', id: bookingId, depth: 2, overrideAccess: true })
    .catch(() => null)) as Record<string, any> | null
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const pkg = typeof booking.package === 'object' ? booking.package : null
  const departure = typeof booking.packageDeparture === 'object' ? booking.packageDeparture : null

  const accept = resolveProductAccept({
    override: booking.onlinePaymentOverride,
    departureAccept: departure?.acceptOnlinePayment,
    packageDefault: pkg?.defaultAcceptOnlinePayment,
  })
  if (!accept) {
    return NextResponse.json({ error: 'Online payment is disabled for this booking / departure.' }, { status: 400 })
  }

  const total = typeof booking.totalPrice === 'number' ? booking.totalPrice : 0
  const paid = typeof booking.paidAmount === 'number' ? booking.paidAmount : 0
  const due = total - paid
  if (due <= 0) return NextResponse.json({ error: 'Nothing due on this booking.' }, { status: 400 })

  const currency = booking.currency || settings.defaultCurrency || 'INR'
  const amountPaise = Math.round(due * 100)

  const userDoc = typeof booking.user === 'object' ? booking.user : null
  const customer = {
    name: booking.guestName || userDoc?.name || undefined,
    email: booking.guestEmail || userDoc?.email || booking.contactDetails?.email || undefined,
    contact: booking.guestPhone || booking.contactDetails?.phone || undefined,
  }

  const expiryHours = settings.paymentLinkExpiryHours || 48
  const expireBy = Math.floor(Date.now() / 1000) + expiryHours * 3600
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const business = settings.businessName || 'Lets Tour'
  const description = `${business} · ${booking.bookingReference} · ${pkg?.name || 'Booking'}`

  try {
    const link = await createPaymentLink({
      amountPaise,
      currency,
      referenceId: booking.bookingReference,
      description,
      customer,
      callbackUrl: serverUrl ? `${serverUrl}/booking/thank-you` : undefined,
      expireBy,
      notes: { bookingId: String(booking.id), bookingReference: booking.bookingReference },
    })

    await payload.update({
      collection: 'bookings',
      id: bookingId,
      overrideAccess: true,
      data: { paymentLinkUrl: link.short_url, razorpayPaymentLinkId: link.id },
    })

    // Best-effort email of the link to the customer via the configured adapter.
    if (customer.email) {
      try {
        await payload.sendEmail({
          to: customer.email,
          subject: `Complete your payment — ${booking.bookingReference}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color:#FBAE3D;">Payment for your booking</h2>
              <p>Hi ${customer.name || 'there'},</p>
              <p>Please complete the payment of <strong>${currency} ${due.toLocaleString('en-IN')}</strong>
                 for booking <strong>${booking.bookingReference}</strong> (${pkg?.name || 'your trip'}).</p>
              <p><a href="${link.short_url}" style="display:inline-block;padding:10px 18px;background:#FBAE3D;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Pay Now</a></p>
              <p style="font-size:12px;color:#888;">Or open this link: ${link.short_url}</p>
            </div>`,
        })
      } catch (e) {
        payload.logger.error(`Failed to email payment link: ${e}`)
      }
    }

    return NextResponse.json({ url: link.short_url, id: link.id })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create payment link' },
      { status: 502 },
    )
  }
}
