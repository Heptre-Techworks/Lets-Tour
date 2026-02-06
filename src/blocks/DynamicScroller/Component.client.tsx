'use client'

import React, { useRef, useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// --- Types ---
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

type Activity = {
  icon?: Media | string | null
  description?: string
  detailsImage?: Media | string | null
  text?: string
}

type Item = {
  blockType: 'packageItem' | 'itineraryDay' | 'destinationItem'
  id?: string
  slug?: string
  href?: string
  activities?: Activity[]
  day?: string | number
  title?: string
  image?: Media
  price?: string | number
  tag?: string
  tagColor?: string
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
  headerTypography?: any
  cardTypography?: any
  navigation?: {
    position?: string
  }
  items?: Item[]
  vibes?: VibeGroup[]
  itinerarySource?: 'manual' | 'package'
  packageRelation?: any
}

interface ItineraryCardProps {
  item: Item
  defaultExpanded?: boolean
}

// --- Utils ---

/** Custom smooth scroll helper for consistent cross-browser behavior */
const smoothScroll = (element: HTMLDivElement, target: number, duration: number = 400) => {
  const start = element.scrollLeft
  const change = target - start
  let currentTime = 0
  const increment = 20

  const animateScroll = () => {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    element.scrollLeft = val
    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    }
  }
  animateScroll()
}

const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2
  if (t < 1) return (c / 2) * t * t + b
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return '0'
  const num = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}

function resolveMediaUrl(media: Media): string | undefined {
  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as any
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
    const m = media as any
    return (m.alt ?? '').trim() || fallback
  }
  return fallback
}

// --- Icons ---
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
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

// --- Cards ---

const PackageCard: React.FC<{ item: any; activeFont?: string; fontStyle?: string; isCustom?: boolean }> = ({ item, activeFont, fontStyle, isCustom }) => {
  const title = item.title || ''
  const image = item.image
  const price = item.price || '0'
  const href = item.href || '#'
  const src = resolveMediaUrl(image)
  const alt = resolveMediaAlt(image, title)

  return (
    <Link
      href={href}
      className="relative w-72 h-96 flex-shrink-0 snap-start rounded-2xl shadow-lg overflow-hidden group bg-black/5 block hover:shadow-2xl transition-all duration-500"
    >
      {src ? (
        <Image
          fill
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

      {item.tag && (
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-full ${item.tagColor || 'bg-white/90 text-gray-900'} text-[18px] shadow-sm`}
            style={{ fontFamily: activeFont }}
          >
            {item.tag}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 p-5 text-white w-full z-10">
        <h3 
            className={`font-bold group-hover:text-yellow-300 transition-colors duration-300 text-3xl sm:text-4xl leading-[0.9] tracking-tight ${!isCustom ? 'font-amiri italic' : ''}`}
            style={{ 
                fontFamily: activeFont,
                fontStyle: isCustom ? 'normal' : 'italic'
            }}
        >
          {title}
        </h3>
        <hr className="my-3 border-white/30" />
        <p className="text-[16px] leading-tight" style={{ fontFamily: activeFont }}>
          Packages starting at <br />
          <span className="font-bold text-[32px]">₹{formatPrice(price)}</span>
          <span className="ml-2 opacity-80">/person</span>
        </p>
      </div>
    </Link>
  )
}

const DestinationCard: React.FC<{ item: any; activeFont?: string; fontStyle?: string; isCustom?: boolean }> = ({ item, activeFont, fontStyle, isCustom }) => {
  const title = item.title || ''
  const image = item.image
  const price = item.price || '0'
  const href = item.href || '#'
  const src = resolveMediaUrl(image)
  const alt = resolveMediaAlt(image, title)

  return (
    <Link
      href={href}
      className="relative w-72 h-96 flex-shrink-0 snap-start rounded-2xl shadow-lg overflow-hidden group bg-black/5 block transition-all duration-500"
    >
      {src ? (
        <Image
          fill
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 text-white w-full">
        <h3 
            className={`font-bold group-hover:text-yellow-300 transition-colors duration-300 text-3xl sm:text-4xl leading-[0.9] ${!isCustom ? 'font-amiri italic' : ''}`}
            style={{ 
                fontFamily: activeFont,
                fontStyle: isCustom ? 'normal' : 'italic'
            }}
        >
          {title}
        </h3>
        <hr className="my-3 border-white/30" />
        <p className="text-[16px]" style={{ fontFamily: activeFont }}>
          Packages starting at <br />
          <span className="font-bold text-[32px]">{price}</span>
          <span className="opacity-80"> /person</span>
        </p>
      </div>
    </Link>
  )
}

interface ItineraryCardPropsWithStyle extends ItineraryCardProps {
    activeFont?: string
}

const ItineraryCard: React.FC<ItineraryCardPropsWithStyle> = ({ item, defaultExpanded = false, activeFont }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const activities = (item.activities || []) as Activity[]

  return (
    <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden w-full max-w-2xl transition-all duration-500 ease-in-out hover:shadow-md">
      <div
        className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
      >
        <span 
            className="text-black font-bold text-2xl"
            style={{ fontFamily: activeFont }}
        >
            {item.day || 'Day'}
        </span>
        <div
          className={`h-8 w-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <span className="text-xl leading-none">{isExpanded ? '\u2212' : '\u002B'}</span>
        </div>
      </div>
      <div
        className={`transition-[max-height,opacity] duration-700 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 border-t border-gray-100 bg-gray-50/50' : 'max-h-0 opacity-0'}`}
      >
        <div className="space-y-6 p-6">
          {activities.map((activity, idx) => {
            const iconSrc = resolveMediaUrl(activity.icon)
            const detailsSrc = resolveMediaUrl(activity.detailsImage)
            return (
              <div key={idx} className="flex items-start space-x-4 animate-fadeIn">
                <div className="flex-shrink-0 mt-1">
                  {iconSrc ? (
                    <Image
                      fill
                      src={iconSrc}
                      alt=""
                      className="w-6 h-6 rounded-full bg-white shadow-sm p-1 object-contain"
                    />
                  ) : (
                    <span className="text-xl text-yellow-500">✦</span>
                  )}
                </div>
                <div className="flex-grow">
                  <p 
                    className="text-gray-700 text-base leading-relaxed"
                    style={{ fontFamily: activeFont }}
                  >
                    {activity.description}
                  </p>
                  {detailsSrc && (
                    <div className="mt-3 overflow-hidden rounded-lg shadow-sm w-48 h-28">
                      <Image
                        fill
                        src={detailsSrc}
                        alt="Activity"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Sections ---

// Typography Helper
// Typography Helper
const getTypographyStyles = (typography: any, defaultFamily: string = "'Amiri', serif") => {
  const fontMap: Record<string, string> = {
      inter: "'Inter', sans-serif",
      merriweather: "'Merriweather', serif",
      roboto: "'Roboto', sans-serif",
      poppins: "'Poppins', sans-serif",
  }
  const activeFont = typography?.fontFamily ? fontMap[typography.fontFamily] : defaultFamily
  const fontStyle = typography?.fontFamily ? 'normal' : 'italic'
  const isCustom = !!typography?.fontFamily

  const size = typography?.fontSize || 'base'
  const sizeMap: Record<string, { heading: string, subheading: string }> = {
      sm: { heading: 'text-3xl md:text-5xl', subheading: 'text-lg md:text-xl' },
      base: { heading: 'text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px]', subheading: 'text-xl sm:text-xl md:text-xl lg:text-2xl' },
      lg: { heading: 'text-5xl sm:text-6xl md:text-[80px]', subheading: 'text-2xl md:text-[32px]' },
      xl: { heading: 'text-6xl sm:text-7xl md:text-[96px]', subheading: 'text-3xl md:text-[40px]' },
      '2xl': { heading: 'text-7xl sm:text-8xl md:text-[112px]', subheading: 'text-4xl md:text-[48px]' },
  }
  const sizes = sizeMap[size] || sizeMap.base

  return { activeFont, fontStyle, isCustom, sizes }
}

const VibeSection: React.FC<{ section: Section }> = ({ section }) => {
  const vibes = section.vibes || []
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  // Header Styles
  const { activeFont: headerFont, fontStyle: headerStyle, isCustom: isCustomHeader, sizes } = getTypographyStyles(section.headerTypography)
  
  // Card Styles
  const { activeFont: cardFont, fontStyle: cardStyle, isCustom: isCustomCard } = getTypographyStyles(section.cardTypography, "'Inter', sans-serif")

  const scroll = (vibeSlug: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[vibeSlug]
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 288
    const scrollTarget = el.scrollLeft + (direction === 'left' ? -(cardWidth + 24) : cardWidth + 24)
    smoothScroll(el, scrollTarget)
  }

  return (
    <section className="relative overflow-hidden py-16" style={{ fontFamily: headerFont }}>
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 
            className={`font-bold leading-tight text-black ${sizes.heading} ${!isCustomHeader ? 'font-amiri italic' : ''}`}
            style={{ 
                fontFamily: headerFont,
                fontStyle: isCustomHeader ? 'normal' : 'italic'
            }}
          >
            {section.title || 'Vibe Match'}
          </h1>
          {section.subtitle && (
            <p 
                className={`opacity-70 ${sizes.subheading} ${!isCustomHeader ? 'font-nats' : ''}`}
                style={{ fontFamily: headerFont }}
            >
                {section.subtitle}
            </p>
          )}
        </header>
        <div className="space-y-20">
          {vibes.map((vibe) => (
            <div key={vibe.vibeSlug} className="relative">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-3xl font-bold font-amiri text-gray-800">{vibe.vibeName}</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => scroll(vibe.vibeSlug, 'left')}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 text-white transition-all"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => scroll(vibe.vibeSlug, 'right')}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 text-white transition-all"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
              <div
                ref={(el) => {
                  scrollRefs.current[vibe.vibeSlug] = el
                }}
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar"
              >
                {vibe.items.map((item, idx) => (
                  <PackageCard key={idx} item={item} activeFont={cardFont} fontStyle={cardStyle} isCustom={isCustomCard} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const DynamicSection: React.FC<{ section: Section }> = ({ section }) => {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(1)
  
  // Header Styles
  const { activeFont: headerFont, fontStyle: headerStyle, isCustom: isCustomHeader, sizes } = getTypographyStyles(section.headerTypography)
  
  // Card Styles
  const { activeFont: cardFont, fontStyle: cardStyle, isCustom: isCustomCard } = getTypographyStyles(section.cardTypography, "'Inter', sans-serif")

  const formattedSlug = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    return (segments[segments.length - 1] || '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }, [pathname])

  const displayTitle = section.title?.replace(/{slug}/gi, formattedSlug) || ''
  const displaySubtitle = "Today's enemy is tomorrow's friend."

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 288
    const scrollTarget = el.scrollLeft + (direction === 'left' ? -(cardWidth + 24) : cardWidth + 24)
    smoothScroll(el, scrollTarget)
  }

  const items = section.items || []
  const packageItems = items.filter((i) => i.blockType === 'packageItem')
  const destinationItems = items.filter((i) => i.blockType === 'destinationItem')
  const itineraryItems = items.filter((i) => i.blockType === 'itineraryDay')

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 288
    setCurrentIndex(Math.round(el.scrollLeft / (cardWidth + 24)) + 1)
  }

  return (
    <section className="relative overflow-hidden py-20" style={{ fontFamily: headerFont }}>
      <div className="absolute left-0 top-[10%] h-[70%] w-[85%] bg-yellow-400/10 -skew-y-3 -z-10" />
      <div className="container mx-auto px-4 relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-8">
            <h1 
                className={`bold text-black whitespace-nowrap leading-none ${sizes.heading} ${!isCustomHeader ? 'font-amiri italic' : ''}`}
                style={{ 
                    fontFamily: headerFont,
                    fontStyle: isCustomHeader ? 'normal' : 'italic'
                }}
            >
              {displayTitle}
            </h1>
            <div className="flex-grow">
              <DashedRule className="opacity-20" />
            </div>
          </div>
          {displaySubtitle && (
            <p 
                className={`text-black mt-4 sm:mt-5 flex items-center leading-tight ${sizes.subheading} ${!isCustomHeader ? 'font-nats' : ''}`}
                style={{ fontFamily: headerFont }}
            >
              {displaySubtitle}
            </p>
          )}
        </header>

        {(section.type === 'package' || section.type === 'destination') && (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory scroll-smooth hide-scrollbar"
          >
            {section.type === 'package' &&
              packageItems.map((item, idx) => <PackageCard key={idx} item={item} activeFont={cardFont} fontStyle={cardStyle} isCustom={isCustomCard} />)}
            {section.type === 'destination' &&
              destinationItems.map((item, idx) => <DestinationCard key={idx} item={item} activeFont={cardFont} fontStyle={cardStyle} isCustom={isCustomCard} />)}
          </div>
        )}

        {section.type === 'itinerary' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {itineraryItems.map((item, idx) => (
              <ItineraryCard key={idx} item={item} defaultExpanded={idx === 0} activeFont={cardFont} />
            ))}
          </div>
        )}

        {section.navigation && (section.type === 'package' || section.type === 'destination') && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => scroll('left')}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 text-white shadow-xl transition-all active:scale-95"
              >
                <ChevronLeft width="24" height="24" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 text-white shadow-xl transition-all active:scale-95"
              >
                <ChevronRight width="24" height="24" />
              </button>
            </div>
            <div className="flex-grow mx-8 opacity-20">
              <DashedRule />
            </div>
            <span className="font-nats text-[48px] md:text-[64px] text-black font-light lining-nums">
              {currentIndex.toString().padStart(2, '0')}
              <span className="mx-2 opacity-30">/</span>
              {(section.type === 'package' ? packageItems.length : destinationItems.length)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

// --- Main Client Component ---
export const DynamicScrollerClient: React.FC<{ sections: Section[] }> = ({
  sections: initialSections = [],
}) => {
  const pathname = usePathname()
  const [sections, setSections] = useState(initialSections)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    const fetchItinerary = async () => {
      const itenSec = sections.find(
        (s) =>
          s.type === 'itinerary' &&
          s.itinerarySource === 'package' &&
          (!s.items || s.items.length === 0),
      )
      if (!itenSec || hasFetchedRef.current) return

      const slug = pathname.split('/').filter(Boolean)[1]
      if (pathname.split('/')[1] !== 'packages' || !slug) return

      try {
        hasFetchedRef.current = true
        const res = await fetch(`/api/packages?where[slug][equals]=${slug}&depth=2&limit=1`)
        const data = await res.json()
        if (data.docs?.[0]?.itinerary) {
          const items: Item[] = data.docs[0].itinerary.map((day: any, i: number) => ({
            blockType: 'itineraryDay',
            id: day.id || `day-${i}`,
            day: day.dayTitle || day.day || `Day ${i + 1}`,
            activities: (day.activities || []).map((a: any) => ({
              icon: a.icon,
              description: a.description || a.text || '',
              detailsImage: a.image || a.detailsImage,
            })),
          }))
          setSections((prev) => prev.map((s) => (s.type === 'itinerary' ? { ...s, items } : s)))
        }
      } catch (e) {
        console.error('Fetch error:', e)
      }
    }
    fetchItinerary()
  }, [pathname, sections])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-amiri { font-family: 'Amiri', serif; }
        .font-nats { font-family: 'NATS', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        
        html { scroll-behavior: smooth; }
      `}</style>
      <div className="min-h-[70vh] font-sans overflow-x-hidden">
        {sections.map((section, idx) =>
          section.type === 'vibe' ? (
            <VibeSection key={idx} section={section} />
          ) : (
            <DynamicSection key={idx} section={section} />
          ),
        )}
      </div>
    </>
  )
}

export default DynamicScrollerClient
