import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'

import { DepartureCalendarForm } from './DepartureCalendarForm'
import type {
  Currency,
  DepartureStatus,
  EndsMode,
  PackageOption,
  PayMode,
  ScheduleDoc,
  ScheduleOption,
} from './departureCalendar.types'

const idOf = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'object' && 'id' in (v as Record<string, unknown>)) return String((v as { id: unknown }).id)
  return String(v)
}
const day = (v: unknown): string => (typeof v === 'string' ? v.slice(0, 10) : '')
const num = (v: unknown): number | null => (typeof v === 'number' && !Number.isNaN(v) ? v : null)
const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'GBP']
const asCurrency = (v: unknown): Currency => (CURRENCIES.includes(v as Currency) ? (v as Currency) : 'INR')

/**
 * /admin/departure-calendar[?id=<scheduleId>]
 *
 * One form to create / edit a recurring departure rule (the existing `departure-schedules`
 * collection) and then preview / generate its dated departures (existing
 * /api/departures/generate endpoint). Same data, same API — only the screen is new.
 * Rendered inside Payload's normal template so the new sidebar + top bar are shared.
 */
export const DepartureCalendarView = async ({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) => {
  const { req } = initPageResult
  const payload = req.payload
  const adminRoute = payload.config.routes?.admin || '/admin'
  const sp = (await Promise.resolve(searchParams)) as Record<string, string | string[] | undefined>
  const rawId = Array.isArray(sp?.id) ? sp.id[0] : sp?.id

  const [schedulesRes, packagesRes, destinationsRes] = await Promise.all([
    payload
      .find({
        collection: 'departure-schedules',
        depth: 0,
        limit: 200,
        pagination: false,
        sort: '-updatedAt',
        req,
        overrideAccess: false,
      })
      .catch(() => ({ docs: [] as any[] })),
    payload
      .find({
        collection: 'packages',
        where: { scheduleType: { equals: 'fixed' } },
        depth: 0,
        limit: 1000,
        pagination: false,
        sort: 'name',
        overrideAccess: true,
      })
      .catch(() => ({ docs: [] as any[] })),
    payload
      .find({
        collection: 'destinations',
        depth: 0,
        limit: 2000,
        pagination: false,
        select: { name: true } as any,
        overrideAccess: true,
      })
      .catch(() => ({ docs: [] as any[] })),
  ])

  const destinationNames = new Map<string, string>()
  for (const d of destinationsRes.docs as any[]) destinationNames.set(String(d.id), String(d.name ?? ''))

  const packages: PackageOption[] = (packagesRes.docs as any[]).map((p) => ({
    id: String(p.id),
    name: String(p.name ?? 'Untitled package'),
    duration: String(p.duration ?? ''),
    price: num(p.price),
    discountedPrice: num(p.discountedPrice),
    currency: asCurrency(p.currency),
    summary: String(p.Summary ?? ''),
    tagline: String(p.tagline ?? ''),
    destinations: (Array.isArray(p.destinations) ? p.destinations : [])
      .map((d: unknown) => destinationNames.get(idOf(d)) || '')
      .filter(Boolean),
    highlights: (Array.isArray(p.highlights) ? p.highlights : [])
      .map((h: any) => String(h?.text ?? ''))
      .filter(Boolean),
    days: (Array.isArray(p.itinerary) ? p.itinerary : []).map((d: any, i: number) => ({
      day: typeof d?.dayNumber === 'number' ? d.dayNumber : i + 1,
      title: String(d?.title ?? d?.day ?? ''),
    })),
  }))

  const schedules: ScheduleOption[] = (schedulesRes.docs as any[]).map((s) => ({
    id: String(s.id),
    title: String(s.title || 'Untitled schedule'),
  }))

  let schedule: ScheduleDoc | null = null
  let notFound = false
  if (rawId) {
    try {
      const s: any = await payload.findByID({
        collection: 'departure-schedules',
        id: rawId,
        depth: 0,
        req,
        overrideAccess: false,
      })
      const df = s.departureDefaults ?? {}
      schedule = {
        id: String(s.id),
        title: String(s.title ?? ''),
        packageId: idOf(s.package),
        startDate: day(s.startDate),
        endsMode: (s.endsMode === 'perpetual' ? 'perpetual' : 'on_date') as EndsMode,
        untilDate: day(s.untilDate),
        horizonMonths: num(s.horizonMonths) ?? 12,
        daysOfWeek: Array.isArray(s.daysOfWeek) ? s.daysOfWeek.map(String) : [],
        intervalWeeks: num(s.intervalWeeks) ?? 1,
        departureTime: String(s.departureTime ?? ''),
        tripNights: num(s.tripNights),
        blackoutDates: (Array.isArray(s.blackoutDates) ? s.blackoutDates : [])
          .map((b: any) => day(b?.date))
          .filter(Boolean),
        capacity: num(df.capacity),
        label: String(df.label ?? ''),
        priceOverride: num(df.priceOverride),
        currency: asCurrency(df.currency),
        status: (df.status ?? 'open') as DepartureStatus,
        acceptOnlinePaymentMode: (df.acceptOnlinePaymentMode ?? 'inherit') as PayMode,
        lastGeneratedAt: typeof s.lastGeneratedAt === 'string' ? s.lastGeneratedAt : null,
        generatedCount: num(s.generatedCount) ?? 0,
      }
    } catch {
      notFound = true
    }
  }

  const perms = initPageResult.permissions?.collections?.['departure-schedules'] as
    | { create?: unknown; update?: unknown }
    | undefined
  const canEdit = Boolean(schedule ? perms?.update : perms?.create)

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={{
        collections: initPageResult.visibleEntities?.collections,
        globals: initPageResult.visibleEntities?.globals,
      }}
    >
      <SetStepNav nav={[{ label: 'Trips & Departures' }, { label: 'Departure Calendar' }]} />
      <DepartureCalendarForm
        adminRoute={adminRoute}
        canEdit={canEdit}
        key={schedule?.id ?? 'new'}
        notFound={notFound}
        packages={packages}
        schedule={schedule}
        schedules={schedules}
      />
    </DefaultTemplate>
  )
}

export default DepartureCalendarView
