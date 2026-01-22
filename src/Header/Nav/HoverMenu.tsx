'use client'
import Link from 'next/link'
import React, { useEffect, useState, useCallback, useRef } from 'react'

type Item = { id: string; name: string; slug: string }

interface HoverMenuProps {
  label: string
  endpoint: string
  hrefBase: string
  onLinkClick?: () => void
  className?: string
}

const LoadingIndicator: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-3">
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-[#FBAE3D] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-[#FBAE3D] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-[#FBAE3D] rounded-full animate-bounce"></div>
    </div>
    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Loading</span>
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
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setOpen((prev) => !prev)
  const closeMenu = useCallback(() => setOpen(false), [])

  const handleLinkClick = useCallback(() => {
    closeMenu()
    onLinkClick?.()
  }, [closeMenu, onLinkClick])

  // --- ESC KEY & CLICK OUTSIDE ---
  useEffect(() => {
    const handleEvents = (event: any) => {
      if (event.key === 'Escape') closeMenu()
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleEvents)
    document.addEventListener('mousedown', handleEvents)
    return () => {
      document.removeEventListener('keydown', handleEvents)
      document.removeEventListener('mousedown', handleEvents)
    }
  }, [closeMenu])

  // --- DATA FETCHING ---
  useEffect(() => {
    if (open && items.length === 0 && !loading) {
      setLoading(true)
      fetch(endpoint)
        .then((r) => r.json())
        .then((data) => {
          const docs = Array.isArray(data?.docs) ? data.docs : []
          setItems(docs.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })))
        })
        .finally(() => setLoading(false))
    }
  }, [open, items.length, loading, endpoint])

  const slugifiedLabel = label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* --- TRIGGER BUTTON --- */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={open}
        className={`
          group flex items-center gap-1.5 py-2
          font-sans text-[15px] sm:text-[18px] lg:text-[20px] font-semibold
          text-gray-900 md:text-white transition-all duration-300
          ${className || ''}
        `}
      >
        <span className="relative">
          {label}
          <span className={`
            absolute -bottom-1 left-0 h-[2px] bg-[#FBAE3D] transition-all duration-300
            ${open ? 'w-full' : 'w-0 group-hover:w-full'}
          `} />
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* --- MOBILE OVERLAY MENU --- */}
      <div
        className={`
          fixed inset-0 z-[1000] bg-black/20 backdrop-blur-sm transition-opacity duration-300 sm:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMenu}
      >
        <div
          className={`
            absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out
            ${open ? 'translate-x-0' : 'translate-x-full'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#FBAE3D]">{label}</span>
              <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {loading ? <LoadingIndicator /> : (
                <div className="grid gap-2">
                  {items.map((it) => (
                    <Link
                      key={it.id}
                      href={`${hrefBase}/${it.slug}`}
                      onClick={handleLinkClick}
                      className="px-4 py-4 text-lg font-medium text-gray-800 active:bg-orange-50 rounded-xl"
                    >
                      {it.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- DESKTOP DROPDOWN --- */}
      <div className={`
        hidden sm:block absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50 transition-all duration-300
        ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}>
        <div className="w-[340px] bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {loading ? <LoadingIndicator /> : (
              <div className="p-3">
                <div className="px-3 py-2 mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Explore {label}</p>
                </div>
                {items.length > 0 ? (
                  <div className="grid gap-1">
                    {items.map((it) => (
                      <Link
                        key={it.id}
                        href={`${hrefBase}/${it.slug}`}
                        onClick={handleLinkClick}
                        className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#FBAE3D] transition-all duration-200"
                      >
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">
                          {it.name}
                        </span>
                        <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm italic">No entries found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}