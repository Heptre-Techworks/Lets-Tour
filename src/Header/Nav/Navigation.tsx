'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Header } from '@/payload-types'
import { CurateButton } from './CurateButton'
import { HoverMenu } from './HoverMenu'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

interface NavigationProps {
  data: Header
}

export const Navigation: React.FC<NavigationProps> = ({ data }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = useMemo(() => data?.navItems || [], [data?.navItems])

  const isCenterLabel = (label?: string) => {
    const v = (label || '').trim().toLowerCase()
    return v === 'destinations' || v === 'packages' || v === 'bulk bookings'
  }

  const stripLinks = useMemo(() => navItems.filter((i) => !isCenterLabel(i.label)), [navItems])

  return (
    <div className={`relative w-full bg-transparent transition-all ${poppins.className}`}>
      {/* 🔹 Top Strip - scrollable on mobile */}
      <div className="flex items-center justify-start w-full px-3 sm:px-5 py-2 sm:py-3 md:py-4 overflow-hidden">
        <nav
          className="
            flex items-center gap-3 sm:gap-5 md:gap-8
            overflow-x-auto md:overflow-visible whitespace-nowrap flex-1
            scrollbar-hidden scroll-smooth
          "
        >
          {stripLinks.map((item, index) => (
            <Link
              key={`${item.href || '#'}-${index}`}
              href={item.href || '#'}
              className="
                text-[14px] sm:text-[15px] md:text-[17px] lg:text-[18px]
                text-black font-medium tracking-tight
                hover:text-gray-600 transition-all
                flex-shrink-0 px-1
              "
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 🔹 Mobile Menu Toggle */}
        <div className="md:hidden ml-3 flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
            className="text-black focus:outline-none transition-transform duration-300"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* 🔹 Center Overlay for Main Menus (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 whitespace-nowrap">
          <HoverMenu
            label="Destinations"
            hrefBase="/destinations"
            endpoint="/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <HoverMenu
            label="Packages"
            hrefBase="/packages"
            endpoint="/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <HoverMenu
            label="Bulk Bookings"
            hrefBase="/bulk-bookings"
            endpoint="/api/bulk-bookings?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <CurateButton data={data} />
        </div>
      </div>

      {/* 🔹 Mobile Dropdown Menu */}
      <div
        className={`
          md:hidden absolute left-1/2 top-full -translate-x-1/2 mt-2
          w-[95%] sm:w-[80%] bg-white border border-black/10 rounded-2xl shadow-xl
          flex flex-col items-center justify-center gap-4 sm:gap-5 py-6 px-4
          text-xs sm:text-sm text-black
          transition-all duration-500 ease-in-out z-40 font-medium
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}
        `}
      >
        <HoverMenu
          label="Destinations"
          hrefBase="/destinations"
          endpoint="/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
        />
        <HoverMenu
          label="Packages"
          hrefBase="/packages"
          endpoint="/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
        />
        <HoverMenu
          label="Bulk Bookings"
          hrefBase="/bulk-bookings"
          endpoint="/api/bulk-bookings?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
        />
        <CurateButton data={data} />
      </div>
    </div>
  )
}
