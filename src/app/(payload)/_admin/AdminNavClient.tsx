'use client'

import React, { useEffect, useState } from 'react'
import { Link, Logout, useNav } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

import type { ResolvedGroup } from './resolveStructure'

const STORAGE_KEY = 'lt-admin-nav-collapsed'

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

export const AdminNavClient: React.FC<{ adminRoute?: string; groups: ResolvedGroup[] }> = ({ groups }) => {
  const pathname = usePathname() || ''
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Remember which groups the admin collapsed (per browser). Failures are harmless.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setCollapsed(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const className = [
    'nav',
    'lt-nav',
    navOpen && 'nav--nav-open',
    shouldAnimate && 'nav--nav-animate',
    hydrated && 'nav--nav-hydrated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={className} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll lt-nav__scroll" ref={navRef}>
        <div className="lt-nav__top">
          <button
            aria-label="Collapse sidebar"
            className="lt-nav__collapse"
            onClick={() => setNavOpen(false)}
            type="button"
          >
            <svg aria-hidden="true" height="14" viewBox="0 0 14 14" width="14">
              <path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        <nav aria-label="Admin sections" className="lt-nav__groups">
          {groups.map((group) => {
            const open = !collapsed[group.id]
            return (
              <div className="lt-nav__group" key={group.id}>
                <button
                  aria-expanded={open}
                  className="lt-nav__group-head"
                  onClick={() => toggleGroup(group.id)}
                  type="button"
                >
                  <span>{group.label}</span>
                  <svg
                    aria-hidden="true"
                    className={open ? 'is-open' : ''}
                    height="12"
                    viewBox="0 0 12 12"
                    width="12"
                  >
                    <path d="m2.5 7.5 3.5-3.5 3.5 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                  </svg>
                </button>
                {open && (
                  <ul className="lt-nav__items">
                    {group.items.map((item) => (
                      <li key={item.key}>
                        <Link
                          aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                          className={`lt-nav__link${isActive(pathname, item.href) ? ' is-active' : ''}`}
                          href={item.href}
                          prefetch={false}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>

        <div className="lt-nav__foot">
          <Logout />
        </div>
      </div>
    </aside>
  )
}

export default AdminNavClient
