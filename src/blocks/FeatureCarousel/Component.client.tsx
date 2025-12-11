// src/blocks/DynamicScroller/Component.client.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// --- TYPES ---
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
  slug?: string
  href?: string
  [key: string]: any
}

type FeatureCarouselClientProps = {
  dataSource?: string
  featureSource?: string
  heading?: string
  subheading?: string
  cards?: Array<{ title?: string; description?: string; mediaUrl?: string }>
  showNavigationButtons?: boolean
  scrollPercentage?: number
}


// --- UTILS ---

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

function transformPackageToCards(
  pkg: any,
  source: string,
): Array<{ title: string; description: string; mediaUrl?: string }> {
  const mapItem = (item: any) => ({
    title: item?.name || item?.title || item?.text || '',
    description: item?.description || item?.summary || item?.text || '',
    mediaUrl: resolveMediaUrl(item?.icon || item?.image || item?.media),
  });

  switch (source) {
    case 'highlights':
      return (pkg.highlights || []).map(mapItem);
    case 'inclusions':
      return (pkg.inclusions || []).map(mapItem);
    case 'activities':
      return (pkg.activities || []).map(mapItem);
    case 'amenities':
      return (pkg.amenities || []).map(mapItem);
    default:
      return [];
  }
}

function getHeadingForSource(packageName: string, source: string): string {
  const headings: Record<string, string> = {
    highlights: `${packageName} Highlights`,
    inclusions: `What's Included in ${packageName}`,
    activities: `Activities in ${packageName}`,
    amenities: `Amenities & Features`,
  }
  return headings[source] || `${packageName} Features`
}

function getSubheadingForSource(pkg: any, source: string): string {
  const subheadings: Record<string, string> = {
    highlights: pkg.tagline || 'Discover what makes this package special',
    inclusions: 'Everything you need for an amazing experience',
    activities: 'Exciting experiences waiting for you',
    amenities: 'Comfort and convenience throughout your journey',
  }
  return subheadings[source] || pkg.summary || ''
}


// --- COMPONENTS ---

/** Renders the feature image/icon, or nothing if no URL is provided. */
const ImagePlaceholder: React.FC<{ mediaUrl?: string }> = ({ mediaUrl }) => {
    if (mediaUrl) {
        return <img src={mediaUrl} alt="Feature Icon" className="w-20 h-20 object-contain" />;
    }
    return null; // Return null to remove the element entirely if no image is found
};

/** Card component for displaying features in the carousel. */
const Card: React.FC<{ title: string; description: string; mediaUrl?: string }> = ({ title, description, mediaUrl }) => {
  const hasMedia = !!mediaUrl;

  return (
    <div
      className="
          flex-shrink-0 w-64 h-80 
          bg-white 
          rounded-2xl 
          shadow-lg 
          p-6 
          flex flex-col justify-between 
          m-4 
          cursor-pointer 
          
          // INTERACTIVE STYLES
          transition-all duration-300 ease-in-out 
          hover:shadow-xl 
          hover:scale-[1.01] 
          hover:translate-y-[-2px] 
          hover:border-2 hover:border-indigo-500
      "
    >
      {/* Image container: Only renders if mediaUrl is present */}
      {hasMedia && (
        <div className="flex-grow w-20 h-20 mb-4 flex items-center justify-center">
            <ImagePlaceholder mediaUrl={mediaUrl} />
        </div> 
      )}
      
      {/* Content wrapper: Adjusts layout if image is missing */}
      <div className={hasMedia ? '' : 'flex-grow flex flex-col justify-end'}>
        <h3 className="font-nats font-bold text-[24px] leading-[24px] tracking-[-0.011em] text-gray-800 mb-2">
          {title}
        </h3>
        <p className="font-nats text-[22px] leading-[24px] tracking-[-0.011em] text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};


// Main component
export const FeatureCarouselClient: React.FC<FeatureCarouselClientProps> = ({
  dataSource = 'manual',
  featureSource = 'highlights',
  heading: initialHeading = 'Discover Our Features',
  subheading:
    initialSubheading = 'Explore the powerful tools that make our platform the best choice for you.',
  cards: initialCards = [],
  showNavigationButtons = true,
  scrollPercentage = 80,
}) => {
  const pathname = usePathname()
  const [scrollPosition, setScrollPosition] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)

  // Dynamic data state
  const [heading, setHeading] = useState(initialHeading)
  const [subheading, setSubheading] = useState(initialSubheading)
  const [cards, setCards] = useState(initialCards)
  const [loading, setLoading] = useState(dataSource === 'auto')

  // Local font helpers
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .font-amiri { font-family: 'Amiri', serif; }
      .font-nats { font-family: 'NATS', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // ✅ Auto-fetch package data from URL
  useEffect(() => {
    const fetchPackageData = async () => {
      if (dataSource !== 'auto') return
      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'packages') {
        setLoading(false)
        return
      }
      const packageSlug = segments[1]
      if (!packageSlug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/packages?where[slug][equals]=${packageSlug}&depth=2&limit=1`,
        )
        const data = await response.json()
        if (data.docs[0]) {
          const pkg = data.docs[0]
          const transformedCards = transformPackageToCards(pkg, featureSource)
          const newHeading = getHeadingForSource(pkg.name, featureSource)
          const newSubheading = getSubheadingForSource(pkg, featureSource)
          setHeading(newHeading)
          setSubheading(newSubheading)
          setCards(transformedCards)
        }
      } catch (error) {
        console.error('❌ Error fetching package data on client:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPackageData()
  }, [pathname, dataSource, featureSource])

  // Calculate widths and max scroll
  useEffect(() => {
    const calculateWidths = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const scrollWidth = container.scrollWidth
        const clientWidth = container.clientWidth
        setContainerWidth(clientWidth)
        setMaxScroll(scrollWidth - clientWidth)
      }
    }
    calculateWidths()
    window.addEventListener('resize', calculateWidths)
    return () => {
      window.removeEventListener('resize', calculateWidths)
    }
  }, [cards])

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = containerWidth * ((scrollPercentage || 80) / 100)
    let newScrollPosition =
      direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount
    newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll))
    setScrollPosition(newScrollPosition)
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center font-sans py-12">
        <div className="text-center text-gray-500">Loading features...</div>
      </div>
    )
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return null
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-center font-sans py-8 md:py-12">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
        {/* Header section */}
        <div className="text-left mb-6 sm:mb-8">
          <h1 className="font-amiri italic flex flex-row font-bold text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1] tracking-[-0.011em] text-gray-900  ">
            {heading}
          </h1>
          <div className="w-full border-t border-dashed border-gray-400"></div>


          {/* Subheading */}
          {subheading && (
            <p className="font-nats text-[18px] sm:text-[22px] md:text-[26px] leading-[1.1] tracking-[-0.011em] text-gray-900 mt-2">
              {subheading}
            </p>
          )}
        </div>

        {/* Carousel section */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-2/3 sm:w-1/2 h-1/2 bg-[#08121E] -z-10"></div>

          <div className="overflow-hidden py-4">
            <div
              ref={containerRef}
              className="flex transition-transform duration-400 ease-in-out space-x-4 px-4 sm:space-x-6 sm:px-6"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {cards.map((item: any, index: number) => (
                <div
                  key={item?.id || index}
                  className="min-w-[150px] sm:min-w-[300px] md:min-w-[350px] lg:min-w-[200px] flex-shrink-0"
                >
                  <Card 
                    title={item?.title || ''} 
                    description={item?.description || ''} 
                    mediaUrl={item?.mediaUrl}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          {showNavigationButtons && (
            <div className="flex items-center mt-6 sm:mt-8">
              <div className="flex-grow border-t border-dashed border-gray-400 mr-4 sm:mr-6"></div>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => handleScroll('left')}
                  disabled={scrollPosition === 0}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  disabled={scrollPosition >= maxScroll - 1}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeatureCarouselClient