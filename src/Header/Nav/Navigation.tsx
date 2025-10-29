'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import { CurateButton } from './CurateButton'
import { HoverMenu } from './HoverMenu'

interface NavigationProps {
  data: Header
}

export const Navigation: React.FC<NavigationProps> = ({ data }) => {
  const navItems = data?.navItems || []

  // Case-insensitive label checks for items that must be centered
  const isCenterLabel = (label?: string) => {
    const v = (label || '').trim().toLowerCase()
    return v === 'destinations' || v === 'packages' || v === 'bulk bookings'
  }

  // Extract the centered link (Bulk bookings) from navItems
  const bulkLink = useMemo(
    () => navItems.find((i) => (i.label || '').trim().toLowerCase() === 'bulk bookings'),
    [navItems],
  )

  // Keep other links in the scrollable strip (exclude the centered ones)
  const stripLinks = useMemo(
    () => navItems.filter((i) => !isCenterLabel(i.label)),
    [navItems],
  )

  return (
    <div className="relative w-full min-w-0">
      {/* 1) Scrollable strip for remaining links only */}
      <div className="content-stretch flex items-center justify-start gap-8 w-full">
        <nav className="flex flex-nowrap items-center gap-8 overflow-x-auto md:overflow-visible whitespace-nowrap min-w-0 flex-1 pr-1 scrollbar-hidden">
          {stripLinks.map((item, index) => (
            <Link
              key={`${item.href || '#'}-${index}`}
              href={item.href || '#'}
              className="font-sans leading-[0.88] not-italic text-[24px] text-white tracking-[-0.011em] hover:text-gray-200 transition-colors"
            >
              <span className="align-middle">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* 2) Centered overlay rail for Destinations + Packages + Bulk bookings + Curate */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
        <div className="pointer-events-auto flex items-center gap-8">
          {/* Destinations dropdown */}
          <HoverMenu
            label="Destinations"
            hrefBase="/destinations"
            endpoint="/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          {/* Packages dropdown */}
          <HoverMenu
            label="Packages"
            hrefBase="/packages"
            endpoint="/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          {/* Bulk bookings (plain link, centered) */}
          {bulkLink ? (
            <Link
              href={bulkLink.href || '#'}
              className="font-sans leading-[0.88] not-italic text-[24px] text-white tracking-[-0.011em] hover:text-gray-200 transition-colors"
            >
              <span className="align-middle">{bulkLink.label}</span>
            </Link>
          ) : null}
          {/* Curate button (centered) */}
          <CurateButton data={data} />
        </div>
      </div>
    </div>
  )
}
