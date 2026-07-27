'use client'

import React from 'react'
import { Link } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

const HREF = '/admin/package-manager'

// Renders in the admin nav (via admin.components.afterNavLinks), styled to match
// Payload's built-in collection/global links (`nav__link` / `nav__link-label`).
export const PackageManagerNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname === HREF

  const label = (
    <>
      {isActive && <div className="nav__link-indicator" />}
      <span className="nav__link-label">Package Manager</span>
    </>
  )

  if (isActive) {
    return (
      <div className="nav__link" id="nav-package-manager">
        {label}
      </div>
    )
  }

  return (
    <Link className="nav__link" href={HREF} id="nav-package-manager" prefetch={false}>
      {label}
    </Link>
  )
}

export default PackageManagerNavLink
