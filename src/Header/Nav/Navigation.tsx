// src/components/site/Header/Nav/Navigation.tsx
'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronLeft } from 'lucide-react'
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

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const isCenterLabel = useCallback((label?: string) => {
    const v = (label || '').trim().toLowerCase()
    return (
      v === 'destinations' ||
      v === 'packages' ||
      v === 'bulk bookings' ||
      v === 'international packages'
    )
  }, [])

  // Define the main menu items that use the HoverMenu
  const mainMenuItems = useMemo(
    () => [
      {
        key: 'destinations',
        label: 'Destinations',
        hrefBase: '/destinations',
        endpoint: '/api/destinations?where[isPublished][equals]=true&limit=50&sort=name&depth=0',
      },
      {
        key: 'packages',
        label: 'Packages',
        hrefBase: '/packages',
        endpoint: '/api/packages?where[isPublished][equals]=true&limit=50&sort=name&depth=0',
      },
    ],
    [],
  )

  // Links that appear in the top strip (i.e., not using HoverMenu)
  const stripLinks = useMemo(
    () => navItems.filter((i) => !isCenterLabel(i.label)),
    [navItems, isCenterLabel],
  )

  // Effect for handling scroll and body overflow when the mobile menu is open
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        closeMobileMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('scroll', handleScroll)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen, closeMobileMenu])

  if (!data) return null

  return (
    <div className={`relative w-full bg-transparent transition-all ${poppins.className}`}>
      {/* Top Strip (Scrollable) */}
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

        {/* Mobile Menu Toggle (Hamburger/X) */}
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

      {/* Center Overlay for Main Menus (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 whitespace-nowrap">
          {mainMenuItems.map((item) => (
            <HoverMenu
              key={`${item.key}-desktop`}
              label={item.label}
              hrefBase={item.hrefBase}
              endpoint={item.endpoint}
            />
          ))}

          <CurateButton data={data} />
        </div>
      </div>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden
                             ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={closeMobileMenu}
      />

      {/* Drawer Content (Sliding from Right) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm md:hidden
                            bg-white shadow-2xl z-50 p-6 
                            flex flex-col transform transition-transform duration-500 ease-in-out
                            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Mobile Drawer Header (Back and Close Icons) */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          {/* ChevronLeft / Back Button (Closes drawer) */}
          <button
            onClick={closeMobileMenu}
            className="text-gray-500 hover:text-black transition p-1"
            aria-label="Back"
          >
            <ChevronLeft size={26} />
          </button>

          {/* Close Button (X) */}
          <button
            onClick={closeMobileMenu}
            className="text-gray-500 hover:text-black transition p-1"
            aria-label="Close Menu"
          >
            <X size={26} />
          </button>
        </div>

        {/* Menu Items (Scrollable content) */}
        <div className="w-full flex flex-col items-start justify-start gap-5 sm:gap-6 overflow-y-auto">
          {mainMenuItems.map((item) => (
            <HoverMenu
              key={`${item.key}-mobile`}
              label={item.label}
              hrefBase={item.hrefBase}
              endpoint={item.endpoint}
              onLinkClick={closeMobileMenu}
              className="text-lg font-semibold text-black hover:text-blue-600 transition w-full p-2"
            />
          ))}

          {stripLinks.map((item, index) => (
            <Link
              key={`mobile-strip-${item.href || '#'}-${index}`}
              href={item.href || '#'}
              onClick={closeMobileMenu}
              className="text-lg font-semibold text-black hover:text-blue-600 transition w-full p-2"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Curate Button */}
        <div className="mt-8 w-full">
          <CurateButton data={data} />
        </div>
      </div>
    </div>
  )
}
