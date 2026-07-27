import crypto from 'crypto'
import type { Payload } from 'payload'

// Server-only Razorpay helper. Uses the raw REST API via fetch (no SDK dependency,
// matching the project's existing external-integration pattern). NEVER import this
// into a client component — it reads RAZORPAY_KEY_SECRET.

const RAZORPAY_API = 'https://api.razorpay.com/v1'

export type PaymentSettingsShape = {
  enableOnlinePayments?: boolean | null
  mode?: string | null
  defaultCurrency?: string | null
  paymentLinkExpiryHours?: number | null
  businessName?: string | null
}

export const keysConfigured = (): boolean =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

export const webhookConfigured = (): boolean => Boolean(process.env.RAZORPAY_WEBHOOK_SECRET)

export const envPaymentsEnabled = (): boolean => process.env.PAYMENTS_ENABLED === 'true'

/** Load the admin Payment Settings global (best-effort). */
export const getPaymentSettings = async (payload: Payload): Promise<PaymentSettingsShape> => {
  try {
    return (await payload.findGlobal({ slug: 'payment-settings', overrideAccess: true })) as PaymentSettingsShape
  } catch {
    return {}
  }
}

/**
 * The effective global gate: env master switch AND keys present AND the admin
 * operational toggle. Product-level (package/departure/booking) checks are layered
 * on top by the API routes.
 */
export const isPaymentsEnabled = (settings: PaymentSettingsShape): boolean =>
  envPaymentsEnabled() && keysConfigured() && settings.enableOnlinePayments === true

const authHeader = (): string =>
  'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')

type RazorpayError = { error?: { description?: string } }

async function razorpayPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${RAZORPAY_API}${path}`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as T & RazorpayError
  if (!res.ok) {
    throw new Error(json?.error?.description || `Razorpay request failed (${res.status})`)
  }
  return json
}

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string }

/** Create a Razorpay Order (amount in integer paise). Used by on-site Checkout. */
export const createOrder = (args: {
  amountPaise: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> =>
  razorpayPost<RazorpayOrder>('/orders', {
    amount: args.amountPaise,
    currency: args.currency,
    receipt: args.receipt,
    notes: args.notes,
  })

export type RazorpayPaymentLink = { id: string; short_url: string; status: string }

/** Create a Razorpay Payment Link (amount in integer paise). Admin-initiated flow. */
export const createPaymentLink = (args: {
  amountPaise: number
  currency: string
  referenceId: string
  description: string
  customer: { name?: string; email?: string; contact?: string }
  callbackUrl?: string
  expireBy?: number // unix seconds
  notes?: Record<string, string>
}): Promise<RazorpayPaymentLink> =>
  razorpayPost<RazorpayPaymentLink>('/payment_links', {
    amount: args.amountPaise,
    currency: args.currency,
    reference_id: args.referenceId,
    description: args.description,
    customer: args.customer,
    notify: { email: Boolean(args.customer.email), sms: Boolean(args.customer.contact) },
    reminder_enable: true,
    callback_url: args.callbackUrl,
    callback_method: args.callbackUrl ? 'get' : undefined,
    expire_by: args.expireBy,
    notes: args.notes,
  })

/** Verify a webhook payload: HMAC-SHA256(rawBody, webhookSecret) === signature header. */
export const verifyWebhookSignature = (rawBody: string, signature: string | null): boolean => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Verify a Checkout success signature: HMAC-SHA256(`orderId|paymentId`, keySecret). */
export const verifyPaymentSignature = (args: {
  orderId: string
  paymentId: string
  signature: string
}): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(args.signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
