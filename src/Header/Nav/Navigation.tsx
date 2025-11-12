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

  if (!data) {
    return null
  }

  return (
    <div className={`relative w-full bg-transparent transition-all ${poppins.className}`}>
      {/* 🔹 Top Strip - scrollable on mobile */}
      <div className="flex items-center justify-start w-full overflow-hidden">
        <nav
          className="
            flex items-center 
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
        <div className="lg:hidden md:hidden ml-3 flex-shrink-0">
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
            key="destinations-desktop"
            label="Destinations"
            hrefBase="/destinations"
            endpoint="/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <HoverMenu
            key="packages-desktop"
            label="Packages"
            hrefBase="/packages"
            endpoint="/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <HoverMenu
            key="bulk-bookings-desktop"
            label="Bulk Bookings"
            hrefBase="/bulk-bookings"
            endpoint="/api/bulk-bookings?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
          />
          <CurateButton data={data} />
        </div>
      </div>

      {/* 🔹 Mobile Dropdown Menu */}
      {/* Popup Overlay */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center 
              bg-black/50 backdrop-blur-sm transition-opacity duration-500 ease-in-out
              ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)} // close when clicking outside
      >
        {/* Popup Card */}
        <div
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          className={`w-[90%] sm:w-[80%] md:w-[60%] max-w-md 
                bg-white border border-black/10 rounded-2xl shadow-2xl
                flex flex-col items-center justify-center gap-4 sm:gap-6 
                py-8 px-6
                text-sm sm:text-base text-black font-medium
                transform transition-all duration-500 ease-in-out
                ${isMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                animate-fadeInUp relative`}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            aria-label="Close Menu"
          >
            ✕
          </button>

          {/* Menu Items */}
          <div className="w-full flex flex-col items-center justify-center gap-4 sm:gap-5 mt-2">
            <HoverMenu
              key="destinations-mobile"
              label="Destinations"
              hrefBase="/destinations"
              endpoint="/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
            />
            <HoverMenu
              key="packages-mobile"
              label="Packages"
              hrefBase="/packages"
              endpoint="/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
            />
            <HoverMenu
              key="bulk-bookings-mobile"
              label="Bulk Bookings"
              hrefBase="/bulk-bookings"
              endpoint="/api/bulk-bookings?where[isPublished][equals]=true&limit=50&sort=name&depth=0"
            />
          </div>

          {/* Curate Button */}
          <div className="mt-6">
            <CurateButton data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
