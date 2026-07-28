import { NextResponse } from 'next/server'
import { headers as getHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/razorpay/helpers'
import { syncSchedule } from '@/lib/departures/syncSchedule'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Preview or commit a departure schedule's generated dates. Admin/agent only.
 * Body: { scheduleId, mode: 'preview' | 'commit' }.
 */
export async function POST(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { scheduleId, mode = 'preview' } = await req.json().catch(() => ({}))
  if (!scheduleId) return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 })

  const schedule = await payload
    .findByID({ collection: 'departure-schedules', id: scheduleId, depth: 0, overrideAccess: true })
    .catch(() => null)
  if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })

  const result = await syncSchedule(payload, schedule, mode === 'commit' ? 'commit' : 'preview')
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  if (mode === 'commit') {
    return NextResponse.json({ created: result.created ?? 0, willSkip: result.willSkip, truncated: result.truncated })
  }
  return NextResponse.json({
    willCreate: result.willCreate,
    willSkip: result.willSkip,
    truncated: result.truncated,
    dates: result.dates,
    skippedDates: result.skippedDates,
  })
}
