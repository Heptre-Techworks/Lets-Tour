'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from '@/components/Link'
import Image from 'next/image'
import { ChevronDown, MapPin, Globe, Layers } from 'lucide-react'
import { JourneyLoader } from '@/components/JourneyLoader'
import { getMegaMenuData } from '@/actions/getMegaMenuData'

// Types
type Country = {
  id: string
  name: string
  continent: string
  region?: string | { name: string }
}

type Destination = {
  id: string
  name: string
  slug: string
  type: 'international' | 'domestic'
  continent?: 'asia' | 'europe' | 'north-america' | 'south-america' | 'africa' | 'oceania'
  country?: Country | string // Handle both expanded and ID cases if depth varies
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
  name: string
  slug: string
  destinations?: Destination[]
  themes?: Theme[]
  Summary?: string
  heroImage?: { url: string; alt?: string }
  overview?: string
}

interface MegaMenuProps {
  label?: string
  type?: 'destinations' | 'packages'
  isOpen?: boolean
  onToggle?: (open: boolean) => void
}

const CONTINENT_LABELS: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  'north-america': 'North America',
  'south-america': 'South America',
  africa: 'Africa',
  oceania: 'Oceania',
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
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null) // For India
  
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  // Fetch Data
  useEffect(() => {
    // Fetch if data is empty (run on mount)
    if (destinations.length === 0 && !loading) {
      setLoading(true)
      
      getMegaMenuData()
        .then((data) => {
          if (data?.destinations) setDestinations(data.destinations as Destination[])
          if (data?.packages) setPackages(data.packages as Package[])
        })
        .finally(() => setLoading(false))
    }
  }, []) // Empty dependency array -> Run once on mount


  // Close on Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (open) {
        handleOpenchange(false)
      }
    }

    if (open) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [open, handleOpenchange])

  // ==========================================
  // LOGIC FOR DESTINATIONS MODE (Tabs: Intl / India)
  // ==========================================

  // 1. International Tab
  const internationalDestinations = useMemo(() => 
    destinations.filter(d => d.type === 'international'), 
  [destinations])

  // Continents
  const continents = useMemo(() => {
    const sourceList = internationalDestinations.map(d => d.continent)
    const set = new Set(sourceList.filter(Boolean))
    return Array.from(set).map(c => CONTINENT_LABELS[c as string] || c).sort()
  }, [internationalDestinations])
  
  // Default Continent
  useEffect(() => {
    if (type === 'destinations' && activeTab === 'international' && (!selectedContinent || !continents.includes(selectedContinent as string)) && continents.length > 0) {
      setSelectedContinent(continents[0] as string)
    }
  }, [type, activeTab, continents, selectedContinent])

  // Countries (Available in selected Continent)
  const availableCountries = useMemo(() => {
    if (!selectedContinent) return []
    // Get destinations in this continent
    const inContinent = internationalDestinations.filter(d => {
        const cLabel = d.continent ? CONTINENT_LABELS[d.continent] : ''
        return cLabel === selectedContinent
    })
    
    // Extract Unique Countries
    const countryMap = new Map<string, string>() // id -> name
    inContinent.forEach(d => {
        if (typeof d.country === 'object' && d.country !== null) {
            countryMap.set(d.country.id, d.country.name)
        }
    })
    
    return Array.from(countryMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name))
  }, [selectedContinent, internationalDestinations])

  // Default Country
  useEffect(() => {
     if (type === 'destinations' && activeTab === 'international' && availableCountries.length > 0) {
         // If current selected country is not in the new list, reset to first
         const exists = availableCountries.find(c => c.id === selectedCountry)
         if (!selectedCountry || !exists) {
             setSelectedCountry(availableCountries[0].id)
         }
     } else if (availableCountries.length === 0) {
         setSelectedCountry(null)
     }
  }, [type, activeTab, availableCountries, selectedCountry])


  // Final Grid: Destinations in Selected Country
  const filteredDestinations = useMemo(() => {
    if (!selectedCountry) return []
    return internationalDestinations.filter(d => 
        typeof d.country === 'object' && d.country?.id === selectedCountry
    )
  }, [selectedCountry, internationalDestinations])


  // 2. India Tab (Destinations -> Regions)
  // Converting "Packages in India" to "Destinations in India" hierarchy as requested
  const domesticDestinations = useMemo(() => 
    destinations.filter(d => d.type === 'domestic'),
  [destinations])

  // Regions (Extracted from Domestic Destinations)
  const domesticRegions = useMemo(() => {
     const regionMap = new Map<string, string>() // id -> name
     domesticDestinations.forEach(d => {
         // @ts-ignore - Assuming region is populated as object due to depth=2, or we need to check type
         if (d.region && typeof d.region === 'object' && d.region.name) {
             // @ts-ignore
             regionMap.set(d.region.id, d.region.name)
         }
     })
     return Array.from(regionMap.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name))
  }, [domesticDestinations])

  // Default Region
  useEffect(() => {
    if (type === 'destinations' && activeTab === 'india' && domesticRegions.length > 0) {
        const exists = domesticRegions.find(r => r.id === selectedRegion)
        if (!selectedRegion || !exists) {
            setSelectedRegion(domesticRegions[0].id)
        }
    }
  }, [type, activeTab, domesticRegions, selectedRegion])

  // Final Grid: Domestic Destinations in Selected Region
  const filteredDomesticDestinations = useMemo(() => {
      if (!selectedRegion) return []
      return domesticDestinations.filter(d => 
          // @ts-ignore
          typeof d.region === 'object' && d.region?.id === selectedRegion
      )
  }, [selectedRegion, domesticDestinations])


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
                 <div className="flex items-center justify-center h-64 w-full">
                    <JourneyLoader text={type === 'destinations' ? 'Mapping Routes...' : 'Curating Packages...'} />
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
                             <div className="flex items-center gap-2 uppercase">
                               <MapPin size={18} />
                               Destinations In India
                             </div>
                           </button>
                        </div>

                        {/* Content */}
                        {activeTab === 'international' && (
                          <div className="flex gap-8">
                            {/* Col 1: Continents */}
                            <div className="w-1/6 border-r border-gray-100 pr-4">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Continents</h3>
                              <ul className="space-y-1">
                                {continents.map(c => (
                                  <li key={c}>
                                    <button
                                      onClick={() => setSelectedContinent(c as string)}
                                      onMouseEnter={() => setSelectedContinent(c as string)}
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
                            
                            {/* Col 2: Countries */}
                            <div className="w-1/6 border-r border-gray-100 pr-4">
                               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Countries</h3>
                               <ul className="space-y-1">
                                  {availableCountries.map(country => (
                                     <li key={country.id}>
                                       <button
                                         onClick={() => setSelectedCountry(country.id)}
                                         onMouseEnter={() => setSelectedCountry(country.id)}
                                         className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                                           ${selectedCountry === country.id
                                             ? 'bg-orange-50 text-[#FBAE3D] shadow-sm'
                                             : 'text-gray-600 hover:bg-gray-50'
                                           }
                                         `}
                                       >
                                         {country.name}
                                       </button>
                                     </li>
                                  ))}
                                  {availableCountries.length === 0 && (
                                     <li className="text-sm text-gray-400 italic px-4">No countries</li>
                                  )}
                               </ul>
                            </div>

                            {/* Col 3: Destinations Grid */}
                            <div className="w-4/6 pl-4">
                               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Destinations in {availableCountries.find(c => c.id === selectedCountry)?.name || '...'}</h3>
                               <div className={`grid grid-cols-2 lg:grid-cols-3 gap-6`}>
                                 {filteredDestinations.map(dest => (
                                   <Link 
                                     key={dest.id}
                                     href={`/destinations/${dest.slug}`}
                                     className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                                   >
                                     {dest.featuredImage?.url && (
                                       <div className="w-16 h-16 relative overflow-hidden rounded-lg border border-gray-100 group-hover/item:border-[#FBAE3D] transition-all bg-gray-100 flex-shrink-0">
                                           <Image 
                                             src={dest.featuredImage.url} 
                                             alt={dest.featuredImage.alt || dest.name}
                                             fill
                                             className="object-cover"
                                             sizes="64px"
                                           />
                                       </div>
                                     )}
                                     <span className="text-sm font-bold text-gray-700 group-hover/item:text-black leading-tight">
                                       {dest.name}
                                     </span>
                                   </Link>
                                 ))}
                                 {filteredDestinations.length === 0 && (
                                    <div className="col-span-3 text-center text-gray-400 py-10 italic">
                                      Select a country to view destinations.
                                    </div>
                                 )}
                               </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'india' && (
                          <div className="flex gap-8">
                             {/* Col 1: Regions */}
                             <div className="w-1/4 border-r border-gray-100 pr-6">
                               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Regions</h3>
                               <ul className="space-y-2">
                                 {domesticRegions.map(region => (
                                   <li key={region.id}>
                                     <button
                                       onClick={() => setSelectedRegion(region.id)}
                                       onMouseEnter={() => setSelectedRegion(region.id)}
                                       className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
                                         ${selectedRegion === region.id
                                           ? 'bg-orange-50 text-[#FBAE3D] shadow-sm'
                                           : 'text-gray-600 hover:bg-gray-50'
                                         }
                                       `}
                                     >
                                       {region.name}
                                     </button>
                                   </li>
                                 ))}
                                 {domesticRegions.length === 0 && (
                                     <li className="text-sm text-gray-400 italic px-4">No regions found</li>
                                 )}
                               </ul>
                             </div>

                             {/* Col 2: Destinations Grid */}
                             <div className="w-3/4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Destinations in {domesticRegions.find(r => r.id === selectedRegion)?.name || 'India'}</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                  {filteredDomesticDestinations.map(dest => (
                                    <Link 
                                      key={dest.id}
                                      href={`/destinations/${dest.slug}`}
                                      className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all text-left"
                                    >
                                      {dest.featuredImage?.url && (
                                       <div className="w-16 h-16 relative overflow-hidden rounded-lg border border-gray-100 group-hover/item:border-[#FBAE3D] transition-all bg-gray-100 flex-shrink-0">
                                           <Image 
                                             src={dest.featuredImage.url} 
                                             alt={dest.featuredImage.alt || dest.name}
                                             fill
                                             className="object-cover"
                                             sizes="64px"
                                           />
                                       </div>
                                     )}
                                     <span className="text-sm font-bold text-gray-700 group-hover/item:text-black leading-tight">
                                       {dest.name}
                                     </span>
                                    </Link>
                                  ))}
                                  {filteredDomesticDestinations.length === 0 && (
                                     <div className="col-span-3 text-center text-gray-400 py-10 italic">
                                       No destinations found in this region.
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
                                 {/* Image */}
                                 {pkg.heroImage?.url && (
                                   <div className="relative w-full h-40 overflow-hidden">
                                     <Image 
                                       src={pkg.heroImage.url} 
                                       alt={pkg.heroImage.alt || pkg.name}
                                       fill
                                       className="object-cover group-hover/item:scale-105 transition-transform"
                                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                     />
                                   </div>
                                 )}
                                 {/* Content */}
                                 <div className="p-4">
                                   <div className="text-[10px] font-bold text-[#FBAE3D] uppercase tracking-wide mb-1">
                                      {pkg.destinations?.[0]?.name}
                                   </div>
                                   <h4 className="text-sm font-bold text-gray-800 leading-tight mb-2 group-hover/item:text-[#FBAE3D] transition-colors">
                                     {pkg.name}
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
