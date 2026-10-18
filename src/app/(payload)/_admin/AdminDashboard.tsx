import React from 'react'
import Link from 'next/link'
import type { Payload } from 'payload'

import { getLeadBadges, resolveStructure } from './resolveStructure'

type Props = {
  payload: Payload
  permissions?: any
  visibleEntities?: { collections?: string[]; globals?: string[] }
}

/**
 * New admin home: each group is a heading followed by a grid of cards.
 * A card opens the collection / global; a "+" opens "create new" (collections only).
 * Rendered by Payload as admin.components.views.dashboard (inside the normal template,
 * so the sidebar and top bar come from Payload as usual).
 */
export const AdminDashboard = async ({ payload, permissions, visibleEntities }: Props) => {
  const groups = resolveStructure({ payload, permissions, visibleEntities })
  const badges = await getLeadBadges(
    payload,
    groups.flatMap((g) => g.items.map((i) => i.slug)),
  )

  return (
    <div className="lt-dash">
      {groups.map((group) => (
        <section className="lt-dash__group" key={group.id}>
          <h2 className="lt-dash__heading">{group.label}</h2>
          <div className="lt-dash__grid">
            {group.items.map((item) => {
              const count = badges[item.slug]
              return (
                <div className="lt-tile" key={item.key}>
                  <Link className="lt-tile__link" href={item.href} prefetch={false}>
                    <span className="lt-tile__title">{item.label}</span>
                  </Link>
                  <p className="lt-tile__desc">{item.desc}</p>
                  {count ? <span className="lt-tile__badge">{count} new</span> : null}
                  {item.createHref ? (
                    <Link
                      aria-label={`Create new ${item.label}`}
                      className="lt-tile__plus"
                      href={item.createHref}
                      prefetch={false}
                      title={`Create new ${item.label}`}
                    >
                      <svg aria-hidden="true" height="14" viewBox="0 0 14 14" width="14">
                        <path d="M7 2v10M2 7h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                      </svg>
                    </Link>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default AdminDashboard
