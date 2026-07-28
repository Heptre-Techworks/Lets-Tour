import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/razorpay/helpers'
import { syncSchedule } from '@/lib/departures/syncSchedule'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Rolling-window cron for PERPETUAL schedules. Re-materializes each perpetual
 * schedule's [today, today + horizonMonths] window (additive/idempotent), so future
 * departures stay available without an admin clicking Generate.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}` (same secret as Payload's jobs.access).
 * Wired via vercel.json cron (Vercel Cron sends the configured bearer on a GET).
 */
async function handle(req: Request) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const schedules = await payload.find({
    collection: 'departure-schedules',
    where: { endsMode: { equals: 'perpetual' } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  let totalCreated = 0
  const results: Array<{ schedule: string; created: number }> = []
  for (const s of schedules.docs as any[]) {
    try {
      const r = await syncSchedule(payload, s, 'commit')
      if (r.ok) {
        totalCreated += r.created ?? 0
        results.push({ schedule: String(s.id), created: r.created ?? 0 })
      }
    } catch (e) {
      payload.logger.error(`roll schedule ${s.id} failed: ${e}`)
    }
  }

  return NextResponse.json({ ran: schedules.docs.length, totalCreated, results })
}

export const GET = handle
export const POST = handle
