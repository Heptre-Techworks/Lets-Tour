import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/razorpay/helpers'
import {
  envPaymentsEnabled,
  getPaymentSettings,
  isPaymentsEnabled,
  keysConfigured,
  webhookConfigured,
} from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

// Read-only gateway status for the admin Payment Settings panel. Never returns secrets.
export async function GET() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await getPaymentSettings(payload)
  return NextResponse.json({
    envEnabled: envPaymentsEnabled(),
    keysConfigured: keysConfigured(),
    webhookConfigured: webhookConfigured(),
    operationalEnabled: settings.enableOnlinePayments === true,
    effectiveEnabled: isPaymentsEnabled(settings),
    mode: process.env.RAZORPAY_MODE || settings.mode || 'test',
  })
}
