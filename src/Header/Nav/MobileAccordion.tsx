// src/Header/Nav/MobileAccordion.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link' // Use standard next/link or your custom Link
import { ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileAccordionProps {
  label: string
  endpoint: string
  hrefBase: string // e.g. /destinations or /themes
  onLinkClick?: () => void
}

type Item = { id: string; name: string; slug: string }

export const MobileAccordion: React.FC<MobileAccordionProps> = ({
  label,
  endpoint,
  hrefBase,
  onLinkClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen && !hasFetched && !loading) {
      setLoading(true)
      try {
        const res = await fetch(endpoint)
        const data = await res.json()
        const docs = Array.isArray(data?.docs) ? data.docs : []
        setItems(docs.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })))
        setHasFetched(true)
      } catch (error) {
        console.error('Failed to fetch menu items:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleItemClick = (slug: string) => {
    if (onLinkClick) onLinkClick()
    router.push(`${hrefBase}/${slug}`)
  }

  return (
    <div className="w-full border-b border-gray-100 last:border-0">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className={`text-lg font-semibold transition-colors ${isOpen ? 'text-[#FBAE3D]' : 'text-black group-hover:text-gray-600'}`}>
          {label}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FBAE3D]' : ''}`} 
        />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pl-4 pb-4 space-y-2 border-l-2 border-gray-100 ml-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.slug)}
                className="block w-full text-left py-2 text-[15px] font-medium text-gray-600 hover:text-[#FBAE3D] hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                {item.name}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic py-2">No items found</div>
          )}
        </div>
      </div>
    </div>
  )
}
