import React from 'react'
import type { Payload } from 'payload'

import { AdminNavClient } from './AdminNavClient'
import { resolveStructure } from './resolveStructure'

type Props = {
  payload: Payload
  permissions?: any
  visibleEntities?: { collections?: string[]; globals?: string[] }
}

/**
 * Replaces Payload's default sidebar (admin.components.Nav).
 * Server part: works out which groups/items this user may see. Client part: renders them.
 */
export const AdminNav = ({ payload, permissions, visibleEntities }: Props) => {
  const groups = resolveStructure({ payload, permissions, visibleEntities })
  const adminRoute = payload.config.routes?.admin || '/admin'
  return <AdminNavClient adminRoute={adminRoute} groups={groups} />
}

export default AdminNav
