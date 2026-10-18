import { getPayload } from 'payload'
import type { SanitizedConfig } from 'payload'

import { AdminDashboard } from './AdminDashboard'
import { AdminNav } from './AdminNav'
import { AppIcon } from './AppIcon'
import { DepartureCalendarView } from './DepartureCalendarView'

const APPLIED = Symbol.for('lets-tour.admin-structure.applied')

type Mutable = SanitizedConfig & { [APPLIED]?: boolean }

/**
 * Plugs the new admin UI into Payload WITHOUT touching payload.config.ts or any collection:
 *
 *   - Nav                         → grouped sidebar (see structure.ts)
 *   - views.dashboard             → grouped card dashboard
 *   - views.departureCalendar     → /admin/departure-calendar form
 *   - graphics.Icon               → hexagon mark in the top bar
 *   - theme                       → dark (the design is dark-only)
 *
 * It only changes how the admin is DISPLAYED. Collections, fields, access rules, hooks, the REST /
 * GraphQL API and all stored data are untouched.
 *
 * It is idempotent and applied to both the resolved config and the config object held by the
 * Payload instance (they can be different objects when Next bundles routes separately).
 * Components are passed as functions (not import-map strings) on purpose, so Payload's
 * auto-generated importMap.js never needs to know about them.
 */
const apply = (config: Mutable) => {
  if (config[APPLIED]) return

  const admin = config.admin as any
  admin.theme = 'dark'
  admin.components = admin.components ?? {}
  const components = admin.components

  components.Nav = AdminNav
  components.graphics = { ...(components.graphics ?? {}), Icon: AppIcon }
  components.views = components.views ?? {}
  components.views.dashboard = { Component: AdminDashboard }
  components.views.departureCalendar = {
    Component: DepartureCalendarView,
    path: '/departure-calendar',
  }

  config[APPLIED] = true
}

export async function applyAdminStructure(
  configPromise: Promise<SanitizedConfig>,
): Promise<SanitizedConfig> {
  const config = (await configPromise) as Mutable
  apply(config)

  // The Payload instance may hold a different config object than the one we imported.
  try {
    const payload = await getPayload({ config: configPromise })
    apply(payload.config as Mutable)
  } catch {
    /* if the instance is not ready yet, the next request re-applies */
  }

  return config
}

export default applyAdminStructure
