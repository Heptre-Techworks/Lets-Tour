'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from '@/components/Link'
import { ChevronDown, MapPin, Globe, Layers } from 'lucide-react'

// Types
type Destination = {
  id: string
  name: string
  slug: string
  type: 'international' | 'domestic'
  continent?: string
  visited?: boolean
  featuredImage?: { url: string; alt?: string }
}

type Theme = {
  id: string
  name: string
  slug?: string
}

type Package = {
  id: string
  title: string
  slug: string
  destination?: Destination
  themes?: Theme[]
  overview?: string
}

interface MegaMenuProps {
  label?: string
  type?: 'destinations' | 'packages'
  isOpen?: boolean
  onToggle?: (open: boolean) => void
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ 
  label = 'Destinations', 
  type = 'destinations',
  isOpen,
  onToggle
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = isOpen !== undefined
  const open = isControlled ? isOpen : internalOpen
  
  const handleOpenchange = (v: boolean) => {
    if (onToggle) onToggle(v)
    if (!isControlled) setInternalOpen(v)
  }

  const [activeTab, setActiveTab] = useState<'international' | 'india'>('international')
  
  // Data State
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)

  // Selection States
  const [selectedContinent, setSelectedContinent] = useState<string>('Asia')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  // Fetch Data
  useEffect(() => {
    if (open && destinations.length === 0 && !loading) {
      setLoading(true)
      
      Promise.all([
        // Fetch Destinations
        fetch('/api/destinations?where[isPublished][equals]=true&limit=100&depth=1').then(r => r.json()),
        // Fetch Packages
        fetch('/api/packages?where[isPublished][equals]=true&limit=100&depth=1').then(r => r.json())
      ])
      .then(([destData, pkgData]) => {
        if (destData?.docs) setDestinations(destData.docs)
        if (pkgData?.docs) setPackages(pkgData.docs)
      })
      .finally(() => setLoading(false))
    }
  }, [open, destinations.length, packages.length, loading])


  // ==========================================
  // LOGIC FOR DESTINATIONS MODE (Tabs: Intl / India)
  // ==========================================

  // 1. International Tab
  const internationalDestinations = useMemo(() => 
    destinations.filter(d => d.type === 'international'), 
  [destinations])

  const continents = useMemo(() => {
    const sourceList = internationalDestinations.map(d => d.continent)
    const set = new Set(sourceList.filter(Boolean))
    return Array.from(set).map(c => (c as string).charAt(0).toUpperCase() + (c as string).slice(1)).sort()
  }, [internationalDestinations])
  
  // Default Continent
  useEffect(() => {
    if (type === 'destinations' && activeTab === 'international' && (!selectedContinent || !continents.includes(selectedContinent)) && continents.length > 0) {
      setSelectedContinent(continents[0])
    }
  }, [type, activeTab, continents, selectedContinent])

  const filteredDestinations = useMemo(() => {
    if (!selectedContinent) return []
    return internationalDestinations.filter(d => 
       d.continent && d.continent.toLowerCase() === selectedContinent.toLowerCase()
    )
  }, [selectedContinent, internationalDestinations])

  // 2. India Tab (Packages) - Kept for Destinations menu as "Packages in India"
  const domesticPackages = useMemo(() => 
    packages.filter(p => p.destination && p.destination.type === 'domestic'),
  [packages])

  const domesticThemes = useMemo(() => {
    const themeMap = new Map<string, string>()
    domesticPackages.forEach(p => {
      p.themes?.forEach(t => themeMap.set(t.id, t.name))
    })
    return Array.from(themeMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name))
  }, [domesticPackages])

  // Default Theme for Domestic Tab
  useEffect(() => {
    if (type === 'destinations' && activeTab === 'india' && !selectedTheme && domesticThemes.length > 0) {
      setSelectedTheme(domesticThemes[0].id)
    }
  }, [type, activeTab, domesticThemes, selectedTheme])

  const filteredDomesticPackages = useMemo(() => {
    if (!selectedTheme) return []
    return domesticPackages.filter(p => 
      p.themes && p.themes.some(t => t.id === selectedTheme)
    )
  }, [domesticPackages, selectedTheme])


  // ==========================================
  // LOGIC FOR PACKAGES MODE (Unified: Themes)
  // ==========================================
  
  // 1. All Themes (from both International and Domestic packages)
  const allThemes = useMemo(() => {
    const themeMap = new Map<string, string>()
    packages.forEach(p => {
      p.themes?.forEach(t => themeMap.set(t.id, t.name))
    })
    return Array.from(themeMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name))
  }, [packages])

  // Default Theme selection for Packages Mode
  useEffect(() => {
    if (type === 'packages' && !selectedTheme && allThemes.length > 0) {
      setSelectedTheme(allThemes[0].id)
    }
  }, [type, allThemes, selectedTheme])

  // 2. Filter All Packages by Selected Theme
  const filteredAllPackages = useMemo(() => {
     if (!selectedTheme) return []
     return packages.filter(p => 
        p.themes && p.themes.some(t => t.id === selectedTheme)
     )
  }, [packages, selectedTheme])


  return (
    <div className="group inline-block static">
      <button 
        className="relative z-50 flex items-center gap-1.5 py-4 font-sans text-[15px] sm:text-[18px] lg:text-[20px] font-semibold text-gray-900 md:text-white hover:text-[#FBAE3D] transition-colors"
        onMouseEnter={() => handleOpenchange(true)}
        onClick={() => handleOpenchange(!open)}
      >
        {label}
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div 
        className={`fixed left-0 right-0 top-[80px] w-full z-40 transition-all duration-300 transform origin-top
          ${open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}
        `}
        onMouseEnter={() => handleOpenchange(true)}
        onMouseLeave={() => handleOpenchange(false)}
      >
        <div className="bg-white shadow-2xl border-t border-gray-100 max-h-[85vh] overflow-y-auto w-full rounded-b-3xl mx-auto">
          <div className="container mx-auto px-4 py-8">
            
            <div className="min-h-[400px]">
               {loading ? (
                 <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
                    <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce delay-150" />
                 </div>
               ) : (
                 <>
                   {/* ======================= */}
                   {/* DESTINATIONS LAYOUT     */}
                   {/* ======================= */}
                   {type === 'destinations' && (
                     <>
                        {/* Tabs Header */}
                        <div className="flex border-b border-gray-100 mb-8">
                           <button
                             onClick={() => setActiveTab('international')}
                             className={`px-8 py-4 text-sm font-bold tracking-wide transition-all border-b-2
                               ${activeTab === 'international' 
                                 ? 'border-[#FBAE3D] text-[#FBAE3D]' 
                                 : 'border-transparent text-gray-400 hover:text-gray-600'
                               }
                             `}
                           >
                             <div className="flex items-center gap-2 uppercase">
                                <Globe size={18} />
                                International Destinations
                             </div>
                           </button>
                           <button
                             onClick={() => setActiveTab('india')}
                             className={`px-8 py-4 text-sm font-bold tracking-wide transition-all border-b-2
                               ${activeTab === 'india' 
                                 ? 'border-[#FBAE3D] text-[#FBAE3D]' 
                                 : 'border-transparent text-gray-400 hover:text-gray-600'
                               }
                             `}
                           >
                             <div className="flex items-center gap-2">
                               <MapPin size={18} />
                               PACKAGES IN INDIA
                             </div>
                           </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'international' && (
                          <div className="flex gap-8">
                            <div className="w-1/5 border-r border-gray-100 pr-6">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Continents</h3>
                              <ul className="space-y-2">
                                {continents.map(c => (
                                  <li key={c}>
                                    <button
                                      onClick={() => setSelectedContinent(c)}
                                      onMouseEnter={() => setSelectedContinent(c)}
                                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${selectedContinent === c
                                          ? 'bg-orange-50 text-[#FBAE3D] shadow-sm'
                                          : 'text-gray-600 hover:bg-gray-50'
                                        }
                                      `}
                                    >
                                      {c}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="w-4/5">
                               <div className={`grid grid-cols-2 lg:grid-cols-3 gap-6`}>
                                 {filteredDestinations.map(dest => (
                                   <Link 
                                     key={dest.id}
                                     href={`/destinations/${dest.slug}`}
                                     className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                                   >
                                     {dest.featuredImage?.url && (
                                       <div className="w-16 h-16 relative overflow-hidden rounded-lg border border-gray-100 group-hover/item:border-[#FBAE3D] transition-all bg-gray-100 flex-shrink-0">
                                           {/* eslint-disable-next-line @next/next/no-img-element */}
                                           <img 
                                             src={dest.featuredImage.url} 
                                             alt={dest.featuredImage.alt || dest.name}
                                             className="object-cover w-full h-full"
                                           />
                                       </div>
                                     )}
                                     <span className="text-sm font-bold text-gray-700 group-hover/item:text-black leading-tight">
                                       {dest.name}
                                     </span>
                                   </Link>
                                 ))}
                               </div>
                               
                               {filteredDestinations.length === 0 && (
                                  <div className="text-center text-gray-400 py-10 italic">
                                    No items found for {selectedContinent}.
                                  </div>
                               )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'india' && (
                          <div className="flex gap-8">
                             <div className="w-1/5 border-r border-gray-100 pr-6">
                               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Themes</h3>
                               <ul className="space-y-2">
                                 {domesticThemes.map(theme => (
                                   <li key={theme.id}>
                                     <button
                                       onClick={() => setSelectedTheme(theme.id)}
                                       onMouseEnter={() => setSelectedTheme(theme.id)}
                                       className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                                         ${selectedTheme === theme.id
                                           ? 'bg-orange-50 text-[#FBAE3D] shadow-sm'
                                           : 'text-gray-600 hover:bg-gray-50'
                                         }
                                       `}
                                     >
                                       {theme.name}
                                     </button>
                                   </li>
                                 ))}
                               </ul>
                             </div>

                             <div className="w-4/5">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                  {filteredDomesticPackages.map(pkg => (
                                    <Link 
                                      key={pkg.id}
                                      href={`/packages/${pkg.slug}`}
                                      className="group/item block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                                    >
                                      <div className="p-4">
                                        <div className="text-[10px] font-bold text-[#FBAE3D] uppercase tracking-wide mb-1">
                                           {pkg.destination?.name}
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-800 leading-tight mb-2 group-hover/item:text-[#FBAE3D] transition-colors">
                                          {pkg.title}
                                        </h4>
                                      </div>
                                    </Link>
                                  ))}
                                  {filteredDomesticPackages.length === 0 && (
                                     <div className="col-span-3 text-center text-gray-400 py-10 italic">
                                       No packages found for this theme.
                                     </div>
                                  )}
                                </div>
                             </div>
                          </div>
                        )}
                     </>
                   )}

                   {/* ======================= */}
                   {/* PACKAGES LAYOUT (Unified)*/}
                   {/* ======================= */}
                   {type === 'packages' && (
                      <div className="flex gap-8 mt-2">
                        {/* Sidebar: All Themes */}
                        <div className="w-1/5 border-r border-gray-100 pr-6">
                          <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                            <Layers size={14} />
                            All Themes
                          </h3>
                          <ul className="space-y-2">
                            {allThemes.map(theme => (
                              <li key={theme.id}>
                                <button
                                  onClick={() => setSelectedTheme(theme.id)}
                                  onMouseEnter={() => setSelectedTheme(theme.id)}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                                    ${selectedTheme === theme.id
                                      ? 'bg-orange-50 text-[#FBAE3D] shadow-sm'
                                      : 'text-gray-600 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  {theme.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Content: All Packages Filtered by Theme */}
                        <div className="w-4/5">
                           <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                             {filteredAllPackages.map(pkg => (
                               <Link 
                                 key={pkg.id}
                                 href={`/packages/${pkg.slug}`}
                                 className="group/item block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                               >
                                 <div className="p-4">
                                   <div className="text-[10px] font-bold text-[#FBAE3D] uppercase tracking-wide mb-1">
                                      {pkg.destination?.name}
                                   </div>
                                   <h4 className="text-sm font-bold text-gray-800 leading-tight mb-2 group-hover/item:text-[#FBAE3D] transition-colors">
                                     {pkg.title}
                                   </h4>
                                 </div>
                               </Link>
                             ))}
                             {filteredAllPackages.length === 0 && (
                                <div className="col-span-3 text-center text-gray-400 py-10 italic">
                                  No packages found for this theme.
                                </div>
                             )}
                           </div>
                        </div>
                      </div>
                   )}

                 </>
               )}
            </div>

          </div>
          
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100 rounded-b-3xl">
             Need help planning? <a href="https://wa.me/917904277199" className="text-[#FBAE3D] hover:underline font-bold">Chat with our experts</a>
          </div>
        </div>
      </div>
    </div>
  )
}
