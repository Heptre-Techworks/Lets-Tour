import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { PackageManagerClient } from './PackageManagerClient'
import type { DepartureRow, PackageManagerData, PackageOption } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

// Narrow the populated relationship value to the fields we need.
type PopulatedPackage = { id: string; name?: string; price?: number; currency?: string }

const asId = (v: unknown): string | null => {
  if (!v) return null
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && v !== null && 'id' in v) return String((v as { id: unknown }).id)
  return null
}

export const PackageManagerView = async ({ initPageResult, params, searchParams }: AdminViewServerProps) => {
  const { req } = initPageResult
  const payload = req.payload

  const departuresResult = await payload.find({
    collection: 'package-departures',
    depth: 1,
    limit: 2000,
    sort: 'startDate',
    overrideAccess: true,
  })

  const departures: DepartureRow[] = departuresResult.docs.map((doc: Record<string, any>) => {
    const pkg = (typeof doc.package === 'object' && doc.package !== null ? doc.package : null) as PopulatedPackage | null
    const packageId = asId(doc.package)
    const price = doc.priceOverride ?? pkg?.price ?? null
    const currency = doc.currency ?? pkg?.currency ?? 'INR'
    return {
      id: String(doc.id),
      title: doc.title || '',
      packageId,
      packageName: pkg?.name || 'Unknown package',
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      status: doc.status || 'open',
      capacity: doc.capacity ?? null,
      seatsBooked: doc.seatsBooked ?? 0,
      price,
      currency,
      acceptOnlinePayment: Boolean(doc.acceptOnlinePayment),
    }
  })

  // Derive the package filter options from the loaded departures (always relevant).
  const packageMap = new Map<string, string>()
  for (const d of departures) {
    if (d.packageId) packageMap.set(d.packageId, d.packageName)
  }
  const packages: PackageOption[] = Array.from(packageMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const now = new Date()
  const data: PackageManagerData = {
    departures,
    packages,
    paymentsEnabled: process.env.PAYMENTS_ENABLED === 'true',
    todayKey: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    initialMonth: `${now.getFullYear()}-${pad(now.getMonth() + 1)}`,
  }

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
      <Gutter>
        <PackageManagerClient data={data} />
      </Gutter>
    </DefaultTemplate>
  )
}

export default PackageManagerView
