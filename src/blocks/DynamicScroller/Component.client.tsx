// src/blocks/DynamicScroller/Component.client.tsx
'use client'

import React, { useRef, useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Types
type MediaSize = { url?: string | null; width?: number; height?: number }
type Media =
  | {
      id: string
      url?: string | null
      filename?: string | null
      alt?: string | null
      sizes?: Record<string, MediaSize | undefined> | null
    }
  | string
  | null
  | undefined

type Item = {
  blockType: 'packageItem' | 'itineraryDay' | 'destinationItem'
  [key: string]: any
}

type VibeGroup = {
  vibeName: string
  vibeSlug: string
  color?: string
  items: Item[]
}

type Section = {
  id?: string
  type?: 'package' | 'itinerary' | 'destination' | 'vibe'
  title?: string
  subtitle?: string
  theme?: {
    background?: string
    headerAccent?: string
    titleColor?: string
    subtitleColor?: string
  }
  navigation?: {
    position?: string
  }
  items?: Item[]
  vibes?: VibeGroup[]
}

// Utils
function resolveMediaUrl(media: Media): string | undefined {
  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as Exclude<Media, string | null | undefined> & { id: string }
    if (m.url) return m.url
    if (m.filename) return `/media/${m.filename}`
    return undefined
  }
  if (typeof media === 'string') {
    if (/^https?:\/\//i.test(media)) return media
    return undefined
  }
  return undefined
}

function resolveMediaAlt(media: Media, fallback: string): string {
  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as Exclude<Media, string | null | undefined> & { id: string }
    return (m.alt ?? '').trim() || fallback
  }
  return fallback
}

// Icons
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const DashedRule: React.FC<{ className?: string }> = ({ className }) => {
  const style: React.CSSProperties = {
    ['--dash' as any]: '10px',
    ['--gap' as any]: '10px',
    ['--offset' as any]: '50px',
    backgroundImage:
      'repeating-linear-gradient(to right, currentColor 0 var(--dash), transparent 0 calc(var(--dash) + var(--gap)))',
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'calc(var(--dash) + var(--gap)) 1px',
    backgroundPosition: 'var(--offset) 0',
    height: '1px',
    width: '100%',
    opacity: 0.65,
  }
  return <div style={style} className={className} aria-hidden />
}

// Package Card
const PackageCard: React.FC<{ item: any }> = ({ item }) => {
  const title = item.title || ''
  const image = item.image
  const price = item.price || '0'
  const src = resolveMediaUrl(image)
  const alt = resolveMediaAlt(image, title)

  return (
    <div className="relative w-72 h-96 flex-shrink-0 snap-center rounded-2xl shadow-lg overflow-hidden group bg-black/5">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" aria-hidden />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {item.tag && (
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${item.tagColor || 'bg-white/90 text-gray-900'}`}>
            {item.tag}
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 p-5 text-white w-full">
        <h3 className="text-3xl font-bold font-amiri">{title}</h3>
        <hr className="my-2 border-white/50" />
        <p className="text-sm mt-1">
          Packages starting at <br />
          <span className="font-bold text-lg">₹ {price}</span> /person
        </p>
      </div>
    </div>
  )
}

// Destination Card (same layout as PackageCard)
const DestinationCard: React.FC<{ item: any }> = ({ item }) => {
  const title = item.title || ''
  const image = item.image
  const price = item.price || '0'
  const src = resolveMediaUrl(image)
  const alt = resolveMediaAlt(image, title)

  return (
    <div className="relative w-72 h-96 flex-shrink-0 snap-center rounded-2xl shadow-lg overflow-hidden group bg-black/5">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" aria-hidden />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {item.tag && (
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${item.tagColor || 'bg-white/90 text-gray-900'}`}>
            {item.tag}
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 p-5 text-white w-full">
        <h3 className="text-3xl font-bold font-amiri">{title}</h3>
        <hr className="my-2 border-white/50" />
        <p className="text-sm mt-1">
          Packages starting at <br />
          <span className="font-bold text-lg">{price}</span> /person
        </p>
      </div>
    </div>
  )
}

// Itinerary Card
const ItineraryCard: React.FC<{ item: any }> = ({ item }) => {
  const activities = item.activities || []
  return (
    <div className="w-96 flex-shrink-0 snap-start bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-6 font-amiri">{item.day || 'Day'}</h3>
      <div className="space-y-4">
        {activities.map((activity: any, idx: number) => {
          const iconSrc = activity.icon ? resolveMediaUrl(activity.icon) : undefined
          const detailsSrc = activity.detailsImage ? resolveMediaUrl(activity.detailsImage) : undefined
          return (
            <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                {iconSrc ? <img src={iconSrc} alt="" className="w-6 h-6" /> : <div className="w-6 h-6" />}
              </div>
              <div className="flex-grow">
                <p className="text-gray-700">{activity.description}</p>
                {detailsSrc && (
                  <div className="mt-2 flex items-center">
                    <img src={detailsSrc} alt="Details" className="w-24 h-14 object-cover rounded-lg mr-4" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Vibe Section (special layout like your image)
const VibeSection: React.FC<{ section: Section }> = ({ section }) => {
  const vibes = section.vibes || []
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scroll = (vibeSlug: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[vibeSlug]
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 0
    const gap = 24
    const scrollAmount = cardWidth + gap
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  return (
    <section className={`relative overflow-hidden ${section?.theme?.background || 'bg-[#FFD89B]'} py-12`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">{section.title || 'Vibe Match'}</h1>
          {section.subtitle && <p className="text-lg text-gray-700">{section.subtitle}</p>}
        </header>

        <div className="space-y-12">
          {vibes.map((vibe) => (
            <div key={vibe.vibeSlug} className="relative">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold font-amiri">{vibe.vibeName}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scroll(vibe.vibeSlug, 'left')}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white shadow-md hover:scale-110 transition-transform"
                    aria-label="Previous"
                    type="button"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => scroll(vibe.vibeSlug, 'right')}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white shadow-md hover:scale-110 transition-transform"
                    aria-label="Next"
                    type="button"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div
                ref={(el) => {
                  scrollRefs.current[vibe.vibeSlug] = el
                }}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' } as any}
              >
                {vibe.items.map((item, idx) => (
                  <PackageCard key={item.id || idx} item={item} />
                ))}
              </div>

              <div className="mt-2 text-right text-sm text-gray-600">
                {vibe.items.length} packages • {vibe.items.length > 0 ? '1' : '0'}/{vibe.items.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Dynamic Section Component
const DynamicSection: React.FC<{ section: Section }> = ({ section }) => {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(1)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Slug replacement
  const formattedSlug = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const rawSlug = segments[segments.length - 1] || ''
    return rawSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }, [pathname])

  const displayTitle = section.title?.replace(/{slug}/gi, formattedSlug) || ''
  const displaySubtitle = section.subtitle?.replace(/{slug}/gi, formattedSlug) || ''

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 0
    const gap = 24
    const scrollAmount = cardWidth + gap
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  const items = (section.items || []) as Item[]
  const isPackage = section.type === 'package'
  const isDestination = section.type === 'destination'
  const packageItems = items.filter(item => item.blockType === 'packageItem')
  const destinationItems = items.filter(item => item.blockType === 'destinationItem')
  const itineraryItems = items.filter(item => item.blockType === 'itineraryDay')
  const packagesCount = packageItems.length
  const destinationsCount = destinationItems.length
  const itineraryCount = itineraryItems.length

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      const scroller = scrollRef.current
      if (!scroller) return
      const scrollLeft = scroller.scrollLeft
      const cardWidth = (scroller.children[0] as HTMLElement | undefined)?.clientWidth || 0
      const gap = 24
      const activeIndex = Math.round(scrollLeft / (cardWidth + gap))
      setCurrentIndex(activeIndex + 1)
    }, 150)
  }

  useEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (scroller) scroller.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [packageItems.length, destinationItems.length, itineraryItems.length])

  const buttonClass =
    'w-12 h-12 rounded-full flex items-center justify-center bg-black text-white shadow-md transition-transform hover:scale-110'

  const navEnabled = Boolean(section.navigation)

  // Handle undefined type or no items
  if (!section.type || items.length === 0) {
    return (
      <section className={`relative overflow-hidden ${section?.theme?.background || 'bg-white'} py-12`}>
        <div className="container mx-auto px-4 text-center text-gray-500">
          {!section.type ? 'Section type not configured' : 'No items available'}
        </div>
      </section>
    )
  }

  return (
    <section className={`relative overflow-hidden ${section?.theme?.background || 'bg-white'} py-12`}>
      <div className="px-4 absolute top-36 left-0 h-[46vh] w-2/3 bg-[rgba(251,174,61,0.9)]" aria-hidden="true" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <header className="mb-10">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl md:text-6xl font-bold flex-shrink-0 pl-[5%]">{displayTitle}</h1>
            <div className="flex-grow w-full border-t-4 border-dotted border-gray-300" />
          </div>
          {displaySubtitle ? <p className="text-lg text-gray-500 mt-2 pl-[5%]">{displaySubtitle}</p> : null}
        </header>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' } as any}
        >
          {isPackage && packageItems.map((item, idx) => <PackageCard key={item.id || idx} item={item} />)}
          {isDestination && destinationItems.map((item, idx) => <DestinationCard key={item.id || idx} item={item} />)}
          {section.type === 'itinerary' && itineraryItems.map((item, idx) => <ItineraryCard key={item.id || idx} item={item} />)}
        </div>

        {isPackage && navEnabled && packagesCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Previous" type="button">
                  <ChevronLeft />
                </button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Next" type="button">
                  <ChevronRight />
                </button>
              </div>
              <div className="mx-3 flex-1"><DashedRule /></div>
              <div className="pr-2">
                <span className="text-3xl font-semibold text-gray-900 tabular-nums">
                  {currentIndex}/{packagesCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {isDestination && navEnabled && destinationsCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Previous" type="button">
                  <ChevronLeft />
                </button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Next" type="button">
                  <ChevronRight />
                </button>
              </div>
              <div className="mx-3 flex-1"><DashedRule /></div>
              <div className="pr-2">
                <span className="text-3xl font-semibold text-gray-900 tabular-nums">
                  {currentIndex}/{destinationsCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {section.type === 'itinerary' && navEnabled && itineraryCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex-1 mr-3"><DashedRule /></div>
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Previous" type="button">
                  <ChevronLeft />
                </button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Next" type="button">
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Main Client Component
export const DynamicScrollerClient: React.FC<{ sections: Section[] }> = ({ sections = [] }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
      .font-amiri { font-family: 'Amiri', serif; }
    `}</style>
    <div className="min-h-screen font-sans">
      {sections.map((section, idx) => {
        // Render special Vibe Section layout
        if (section.type === 'vibe') {
          return <VibeSection key={section?.id || `vibe-${idx}`} section={section} />
        }
        
        // Render standard sections
        return (
          <DynamicSection 
            key={typeof section?.id === 'string' ? section.id : `section-${idx}`} 
            section={section} 
          />
        )
      })}
    </div>
  </>
)

export default DynamicScrollerClient
