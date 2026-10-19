import type { Payload } from 'payload'
import { ADMIN_GROUPS, HIDDEN_SLUGS, LEAD_BADGES } from './structure'

/** Plain, serialisable shapes (safe to pass from server components to client components). */
export type ResolvedItem = {
  key: string
  label: string
  desc: string
  slug: string
  href: string
  createHref?: string
}

export type ResolvedGroup = {
  id: string
  label: string
  items: ResolvedItem[]
}

type VisibleEntities = { collections?: string[]; globals?: string[] } | undefined
// `permissions` comes straight from Payload's initPageResult; we only read `.read` / `.create`.
type Permissions = {
  collections?: Record<string, { read?: unknown; create?: unknown } | undefined>
  globals?: Record<string, { read?: unknown } | undefined>
} | undefined

const prettify = (slug: string) =>
  slug
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Turns the static ADMIN_GROUPS registry into what THIS user can actually see:
 *  - drops items whose collection/global is not registered, hidden, or not readable by the user
 *  - appends an "Other" group for any visible collection/global that is not in the registry,
 *    so nothing that exists in Payload can ever become unreachable.
 */
export function resolveStructure(args: {
  payload: Payload
  permissions: Permissions
  visibleEntities: VisibleEntities
}): ResolvedGroup[] {
  const { payload, permissions, visibleEntities } = args
  const adminRoute = payload.config.routes?.admin || '/admin'

  const visCollections = new Set(visibleEntities?.collections ?? [])
  const visGlobals = new Set(visibleEntities?.globals ?? [])
  const canReadCollection = (slug: string) =>
    visCollections.has(slug) && Boolean(permissions?.collections?.[slug]?.read)
  const canCreateCollection = (slug: string) => Boolean(permissions?.collections?.[slug]?.create)
  const canReadGlobal = (slug: string) =>
    visGlobals.has(slug) && Boolean(permissions?.globals?.[slug]?.read)

  const used = new Set<string>()
  const groups: ResolvedGroup[] = []

  for (const group of ADMIN_GROUPS) {
    const items: ResolvedItem[] = []
    for (const def of group.items) {
      if (def.kind === 'collection') {
        used.add(`c:${def.slug}`)
        if (HIDDEN_SLUGS.has(def.slug) || !canReadCollection(def.slug)) continue
        items.push({
          key: `c:${def.slug}`,
          label: def.label,
          desc: def.desc,
          slug: def.slug,
          href: `${adminRoute}/collections/${def.slug}`,
          createHref:
            def.create && canCreateCollection(def.slug)
              ? `${adminRoute}/collections/${def.slug}/create`
              : undefined,
        })
      } else if (def.kind === 'global') {
        used.add(`g:${def.slug}`)
        if (HIDDEN_SLUGS.has(def.slug) || !canReadGlobal(def.slug)) continue
        items.push({
          key: `g:${def.slug}`,
          label: def.label,
          desc: def.desc,
          slug: def.slug,
          href: `${adminRoute}/globals/${def.slug}`,
        })
      } else {
        // custom view — only needs the departure-schedules permission it works with
        if (!canReadCollection('departure-schedules')) continue
        items.push({
          key: `x:${def.slug}`,
          label: def.label,
          desc: def.desc,
          slug: def.slug,
          href: `${adminRoute}${def.path ?? ''}`,
        })
      }
    }
    if (items.length) groups.push({ id: group.id, label: group.label, items })
  }

  // Safety net: anything visible in Payload that the registry does not mention.
  const other: ResolvedItem[] = []
  for (const c of payload.config.collections) {
    if (used.has(`c:${c.slug}`) || HIDDEN_SLUGS.has(c.slug) || !canReadCollection(c.slug)) continue
    const plural = (c.labels as { plural?: unknown } | undefined)?.plural
    other.push({
      key: `c:${c.slug}`,
      label: typeof plural === 'string' ? plural : prettify(c.slug),
      desc: 'Additional collection',
      slug: c.slug,
      href: `${adminRoute}/collections/${c.slug}`,
      createHref: canCreateCollection(c.slug) ? `${adminRoute}/collections/${c.slug}/create` : undefined,
    })
  }
  for (const g of payload.config.globals) {
    if (used.has(`g:${g.slug}`) || HIDDEN_SLUGS.has(g.slug) || !canReadGlobal(g.slug)) continue
    const label = (g as { label?: unknown }).label
    other.push({
      key: `g:${g.slug}`,
      label: typeof label === 'string' ? label : prettify(g.slug),
      desc: 'Additional setting',
      slug: g.slug,
      href: `${adminRoute}/globals/${g.slug}`,
    })
  }
  if (other.length) groups.push({ id: 'other', label: 'Other', items: other })

  return groups
}

/** "N new" counters for the lead cards on the dashboard. Never throws. */
export async function getLeadBadges(payload: Payload, slugs: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  await Promise.all(
    slugs
      .filter((s) => s in LEAD_BADGES)
      .map(async (slug) => {
        try {
          const res = await payload.count({
            collection: slug as never,
            where: LEAD_BADGES[slug].where as never,
            overrideAccess: true,
          })
          result[slug] = res.totalDocs
        } catch {
          result[slug] = 0
        }
      }),
  )
  return result
}
