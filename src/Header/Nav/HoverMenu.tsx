// src/components/site/Header/Nav/HoverMenu.tsx
'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

type Item = { id: string; name: string; slug: string }

interface HoverMenuProps {
  label: string
  endpoint: string
  hrefBase: string
}

export const HoverMenu: React.FC<HoverMenuProps> = ({ label, endpoint, hrefBase }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const timeoutRef = useRef<number | null>(null)

  const handleEnter = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = window.setTimeout(() => setOpen(false), 220)
  }

  useEffect(() => {
    if (open && items.length === 0 && !loading) {
      setLoading(true)
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
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {/* Label color: white on desktop, black on mobile */}
      <button
        type="button"
        className="
          cursor-pointer font-sans leading-[0.88] text-[14px] sm:text-[20px] md:text-[20px] lg:text-[24px]
          font-medium
          text-black md:text-white
          tracking-[-0.011em] 
          hover:text-gray-700 md:hover:text-gray-200 
          transition-colors
        "
      >
        <span className="align-middle">{label}</span>
      </button>

      {/* Dropdown menu (desktop only) */}
      <div
        className={[
          'absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50',
          'w-[320px] rounded-lg bg-white shadow-xl ring-1 ring-black/5',
          'px-2 py-2 transition-opacity duration-150',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        role="menu"
        aria-label={`${label} menu`}
      >
        {loading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
        ) : (
          <ul className="max-h-[60vh] overflow-auto">
            {items.map((it) => (
              <li key={it.id} role="none">
                <Link
                  href={`${hrefBase}/${it.slug}`}
                  className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
                  role="menuitem"
                >
                  {it.name}
                </Link>
              </li>
            ))}
            {items.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No items</li>}
          </ul>
        )}
      </div>
    </div>
  )
}
