'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from '@/components/Link'
import { ChevronDown, MapPin, Globe } from 'lucide-react'

type Destination = {
  id: string
  name: string
  slug: string
  type: 'international' | 'domestic'
  continent?: string
  region?: { name: string } // assuming relation
  featuredImage?: { url: string; alt?: string }
}

export const MegaMenu: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'international' | 'domestic'>('international')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch data on hover/open
  useEffect(() => {
    if (open && destinations.length === 0 && !loading) {
      setLoading(true)
      // Fetch all published destinations
      fetch('/api/destinations?where[isPublished][equals]=true&limit=100&depth=1')
        .then((r) => r.json())
        .then((data) => {
          if (data?.docs) {
             setDestinations(data.docs)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open, destinations.length, loading])

  // Grouping Logic
  const groupedData = useMemo(() => {
    const relevant = destinations.filter(d => d.type === activeTab)
    
    if (activeTab === 'domestic') {
      return { 'India': relevant } // Just a flat list or grouped by region if available
    }

    // specific grouping for International
    return relevant.reduce((acc, dest) => {
      const group = dest.continent ? dest.continent.charAt(0).toUpperCase() + dest.continent.slice(1) : 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(dest)
      return acc
    }, {} as Record<string, Destination[]>)

  }, [destinations, activeTab])

  return (
    <div className="relative group/menu inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button 
        className="flex items-center gap-1.5 py-4 font-sans text-[15px] sm:text-[18px] lg:text-[20px] font-semibold text-gray-900 md:text-white hover:text-[#FBAE3D] transition-colors"
      >
        Destinations
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute left-0 w-screen max-w-7xl -translate-x-[20%] top-full pt-2 z-50 transition-all duration-300 transform origin-top-left
          ${open ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[400px]">
           {/* Folder Tabs Header */}
           <div className="flex border-b border-gray-100">
             <button
               onClick={() => setActiveTab('international')}
               className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold tracking-wide transition-all
                 ${activeTab === 'international' 
                   ? 'bg-[#FBAE3D] text-white' 
                   : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                 }
               `}
             >
               <Globe size={18} />
               INTERNATIONAL
             </button>
             <button
               onClick={() => setActiveTab('domestic')}
               className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold tracking-wide transition-all
                 ${activeTab === 'domestic' 
                   ? 'bg-[#FBAE3D] text-white' 
                   : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                 }
               `}
             >
               <MapPin size={18} />
               DOMESTIC
             </button>
           </div>
           
           {/* Content Area */}
           <div className="p-8 flex-1 bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                   <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce delay-75" />
                   <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce delay-150" />
                </div>
              ) : Object.keys(groupedData).length === 0 ? (
                 <div className="flex items-center justify-center h-full text-gray-300 italic">
                    No destinations found.
                 </div>
              ) : (
                <div className="grid grid-cols-4 gap-8">
                   {Object.entries(groupedData).map(([group, items]) => (
                      <div key={group} className="flex flex-col gap-3">
                         <h3 className="text-[#FBAE3D] font-bold uppercase tracking-wider text-xs border-b border-orange-100 pb-2 mb-1">
                            {group}
                         </h3>
                         <ul className="space-y-2">
                           {items.map(dest => (
                             <li key={dest.id}>
                               <Link 
                                 href={`/destinations/${dest.slug}`}
                                 className="block text-gray-600 hover:text-black hover:translate-x-1 transition-all text-sm font-medium"
                               >
                                 {dest.name}
                               </Link>
                             </li>
                           ))}
                         </ul>
                      </div>
                   ))}
                </div>
              )}
           </div>
           
           {/* Footer Ad/CTA */}
           <div className="bg-gray-900 text-white p-4 flex justify-between items-center text-xs px-8">
              <span className="opacity-70">Cannot find your dream location?</span>
              <Link href="/custom-trip" className="text-[#FBAE3D] font-bold hover:underline">
                 Customize your own trip &rarr;
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
