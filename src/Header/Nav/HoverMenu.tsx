// src/components/site/Header/Nav/HoverMenu.tsx
'use client'
import Link from 'next/link'
import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom' // Added for improved modal management if needed (currently not used but often helpful)

type Item = { id: string; name: string; slug: string }

interface HoverMenuProps {
  label: string
  endpoint: string
  hrefBase: string
  onLinkClick?: () => void
  className?: string
}

const LoadingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
    </span>
    <span>Loading...</span>
  </div>
)

export const HoverMenu: React.FC<HoverMenuProps> = ({
  label,
  endpoint,
  hrefBase,
  onLinkClick,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])

  // Use a click handler to toggle menu on desktop/mobile
  const toggleMenu = () => setOpen((prevOpen) => !prevOpen)
  const closeMenu = () => setOpen(false)

  // Handle closing the menu and optionally calling a parent handler (from Navigation.tsx)
  const handleLinkClick = useCallback(() => {
    closeMenu()
    if (onLinkClick) {
      onLinkClick()
    }
  }, [onLinkClick])

  // --- ESC KEY CLOSING (UX Enhancement) ---
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  // --- CLICK OUTSIDE CLOSING (UX Enhancement for desktop) ---
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const menuElement = document.getElementById(
        'desktop-menu-container-' + label.replace(/\s+/g, '-'),
      )
      const buttonElement = document.getElementById('menu-button-' + label.replace(/\s+/g, '-'))

      // Close if clicking outside the menu and outside the button
      if (
        open &&
        menuElement &&
        !menuElement.contains(target) &&
        buttonElement &&
        !buttonElement.contains(target)
      ) {
        // Check if the screen is wider than the mobile breakpoint (sm: 640px in Tailwind default)
        if (window.innerWidth >= 640) {
          closeMenu()
        }
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open, label])

  // Data fetching effect
  useEffect(() => {
    if (open && items.length === 0 && !loading) {
      setLoading(true)
      // FIX: Use the native fetch endpoint directly
      fetch(endpoint, { next: { revalidate: 60 } })
        .then((r) => r.json())
        .then((data) => {
          const docs = Array.isArray(data?.docs) ? data.docs : []
          setItems(docs.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })))
        })
        .finally(() => setLoading(false))
    }
  }, [open, items.length, loading, endpoint])

  return (
    <div className="relative">
      {/* --- BUTTON/TRIGGER (Cool Styling) --- */}
      <button
        type="button"
        id={'menu-button-' + label.replace(/\s+/g, '-')}
        className={`
          cursor-pointer font-sans leading-[0.88] text-[14px] sm:text-[20px] md:text-[20px] lg:text-[24px]
          font-medium relative group
          text-black md:text-white
          tracking-[-0.011em] 
          transition-colors duration-300
          ${className || ''} 
        `}
        onClick={toggleMenu}
        aria-expanded={open}
        aria-controls={`mobile-menu-${label.replace(/\s+/g, '-')} desktop-menu-${label.replace(/\s+/g, '-')}`}
      >
        <span className="align-middle group-hover:text-[#FBAE3D] md:group-hover:text-[#FBAE3D] transition-colors">
          {label}
        </span>
        {/* Subtle underline effect */}
        <span className="absolute bottom-[-5px] left-0 h-0.5 w-full bg-[#FBAE3D] transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
      </button>

      {/* 1. MOBILE SLIDE-IN MENU (Fixed, Full-Screen, hidden on 'sm' and up) */}
      <div
        id={`mobile-menu-${label.replace(/\s+/g, '-')}`}
        className={[
          // Base Mobile Styles: Full height, fixed, slide-in from right
          'fixed inset-y-0 right-0 z-[1000] transform transition-transform duration-500 ease-in-out', // Increased Z-index and faster transition
          'w-full bg-white shadow-2xl ',
          'p-6 flex flex-col',
          'sm:hidden',
          // Visibility Logic
          open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none',
        ].join(' ')}
        role="menu"
        aria-label={`${label} mobile menu`}
      >
        {/* --- MOBILE HEADER --- */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <h3 className="font-bold text-xl text-gray-900">{label}</h3>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="p-2 text-gray-700 hover:bg-red-500 hover:text-white rounded-full transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* List Container (Handles scrolling) */}
        <div className="flex-grow overflow-y-hidden">
          {loading ? (
            <LoadingIndicator />
          ) : (
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.id} role="none">
                  <Link
                    href={`${hrefBase}/${it.slug}`}
                    className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-[#FBAE3D]/20 hover:text-gray-900 rounded transition-all duration-200 transform hover:translate-x-1"
                    role="menuitem"
                    onClick={handleLinkClick}
                  >
                    {it.name}
                  </Link>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No items available.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* 2. DESKTOP HOVER MENU (Absolute, Fade-in, hidden below 'sm') */}
      <div
        id={'desktop-menu-container-' + label.replace(/\s+/g, '-')}
        className={[
          'hidden sm:block',
          'absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50',
          'w-[320px] rounded-xl bg-white/95 shadow-2xl ring-1 ring-black/10',
          'p-3 transition-all duration-200',
          open
            ? 'opacity-100 pointer-events-auto scale-100'
            : 'opacity-0 pointer-events-none scale-95',
        ].join(' ')}
        role="menu"
        aria-label={`${label} desktop menu`}
      >
        {loading ? (
          <LoadingIndicator />
        ) : (
          <ul className="max-h-[60vh] overflow-y-auto space-y-1">
            {items.map((it) => (
              <li key={it.id} role="none">
                <Link
                  href={`${hrefBase}/${it.slug}`}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-[#FBAE3D]/20 hover:text-gray-900 rounded transition-all duration-200 transform hover:translate-x-0.5"
                  role="menuitem"
                  onClick={handleLinkClick}
                >
                  {it.name}
                </Link>
              </li>
            ))}
            {items.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No items available.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
