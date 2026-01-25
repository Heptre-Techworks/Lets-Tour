// src/blocks/DynamicScroller/Component.client.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

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

type CardData = {
  title?: string
  description?: string
  iconUrl?: string // Icon URL (small image)
  imageUrl?: string // Full Image URL (large feature image)
}

type FeatureCarouselClientProps = {
  dataSource?: string
  featureSource?: string
  heading?: string
  subheading?: string
  cards?: Array<CardData>
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

function transformPackageToCards(pkg: any, source: string): Array<CardData> {
  const mapItem = (item: any): CardData => ({
    title: item?.name || item?.title || item?.text || '',
    description: item?.description || item?.summary || item?.text || '',
    iconUrl: resolveMediaUrl(item?.icon), // Use icon for iconUrl
    imageUrl: resolveMediaUrl(item?.image || item?.media), // Use image or media for imageUrl
  })

  switch (source) {
    case 'highlights':
      return (pkg.highlights || []).map(mapItem)
    case 'inclusions':
      return (pkg.inclusions || []).map(mapItem)
    case 'activities':
      return (pkg.activities || []).map(mapItem)
    case 'amenities':
      return (pkg.amenities || []).map(mapItem)
    default:
      return []
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
const ImagePlaceholder: React.FC<{ iconUrl?: string }> = ({ iconUrl }) => {
  if (iconUrl) {
    return <Image src={iconUrl} alt="Feature Icon" className="w-full h-full object-contain" fill />
  }
  return null
}

/** Card component for displaying features in the carousel. */
const Card: React.FC<{
  title: string
  description: string
  iconUrl?: string
  imageUrl?: string
}> = ({ title, description, iconUrl, imageUrl }) => {
  const hasIcon = !!iconUrl
  const hasImage = !!imageUrl

  return (
    <div
      className="
          relative flex-shrink-0 w-64 h-80 
          bg-white overflow-hidden group
          rounded-2xl shadow-xl 
          flex flex-col
          m-4 cursor-pointer 
          
          transition-all duration-300 ease-in-out 
          hover:shadow-2xl 
          hover:scale-[1.02] 
          hover:translate-y-[-4px] 
          hover:border-2 hover:border-[#FBAE3D] /* Enhanced hover color */
        "
    >
      {/* 1. FEATURE IMAGE (Background/Top) */}
      {hasImage && (
        <Image
          src={imageUrl}
          alt={title || 'Feature image'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          fill
        />
      )}

      {/* 2. ICON (Small indicator, placed over image or at top if no image) */}
      {hasIcon && (
        <div
          className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center ${hasImage ? 'z-10' : ''}`}
        >
          <ImagePlaceholder iconUrl={iconUrl} />
        </div>
      )}

      {/* 3. CONTENT WRAPPER */}
      <div className={`relative z-10 w-full h-full flex flex-col ${!hasImage ? 'p-6' : ''}`}>
        {/* Fill vertical space above content/icon */}
        <div className="flex-grow min-h-[1rem]"></div>

        <div
          className={
            hasImage
              ? 'p-4 mt-auto rounded-t-xl bg-gradient-to-t from-black/80 to-transparent' // FIX: Removed bg-black/50/backdrop-blur; using a dark gradient for contrast
              : ''
          }
        >
          <h3
            className="font-nats font-bold text-[24px] leading-[24px] tracking-[-0.011em] mb-2"
            // Ensure text is white over dark gradient/image
            style={{ color: hasImage ? 'white' : '#1f2937' }}
          >
            {title}
          </h3>
          <p
            className="font-nats text-[20px] leading-[22px] tracking-[-0.011em]"
            // Ensure text is light gray over dark gradient/image
            style={{ color: hasImage ? '#e5e7eb' : '#4b5563' }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

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

  const containerRef = useRef<HTMLDivElement | null>(null)

  // States related to scroll calculation
  const [containerWidth, setContainerWidth] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [currentScrollLeft, setCurrentScrollLeft] = useState(0) // Tracks actual scroll position

  // Dynamic data state
  const [heading, setHeading] = useState(initialHeading)
  const [subheading, setSubheading] = useState(initialSubheading)
  const [cards, setCards] = useState(initialCards)
  const [loading, setLoading] = useState(dataSource === 'auto')

  // Local font helpers
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      .font-amiri { font-family: 'Amiri', serif; }
      .font-nats { font-family: 'NATS', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Auto-fetch package data from URL
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

  // Calculate widths and max scroll, and attach scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const calculateWidths = () => {
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      setContainerWidth(clientWidth)
      setMaxScroll(scrollWidth - clientWidth)
      setCurrentScrollLeft(container.scrollLeft) // Keep current position updated on resize
    }

    const updateScrollState = () => {
      setCurrentScrollLeft(container.scrollLeft)
    }

    calculateWidths() // Initial calculation

    // Listeners
    window.addEventListener('resize', calculateWidths)
    container.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      window.removeEventListener('resize', calculateWidths)
      container.removeEventListener('scroll', updateScrollState)
    }
  }, [cards])

  // Scroll handling logic updated to use native scrollLeft for smooth scrolling
  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * ((scrollPercentage || 80) / 100)
    let newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    // Clamp scroll position
    newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll))

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    // The scroll listener (updateScrollState) handles state update
  }

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col justify-center items-center font-sans py-12">
        <div className="text-center text-gray-500">Loading features...</div>
      </div>
    )
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return null
  }

  return (
    <div className="w-full min-h-[50vh] flex flex-col justify-center font-sans py-8 md:py-12">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
        {/* Header section */}
        <div className="text-left mb-6 sm:mb-8">
          {/* Decorative Dashed Rule above Heading */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-grow border-t-2 border-dashed border-gray-300"></div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-[#FBAE3D]">
              {featureSource.toUpperCase()}
            </h2>
            <div className="flex-grow border-t-2 border-dashed border-gray-300"></div>
          </div>

          <h1 className="font-amiri italic font-bold text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1] tracking-[-0.011em] text-gray-900">
            {heading}
          </h1>

          {/* Subheading */}
          {subheading && (
            <p className="font-nats text-[18px] sm:text-[22px] md:text-[26px] leading-[1.1] tracking-[-0.011em] text-gray-700 mt-2">
              {subheading}
            </p>
          )}
        </div>

        {/* Carousel section */}
        <div className="relative">
          {/* Background element - Now styled as a subtle corner accent */}
          <div className="absolute top-0 right-0 w-1/4 h-1/2 bg-[#FBAE3D]/10 rounded-bl-[100px] -z-10 transition-all duration-500"></div>

          <div className="py-4 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-16">
            <div
              ref={containerRef}
              // FIX: Removed unnecessary transition classes for smooth scrolling to work correctly
              className="flex overflow-x-auto space-x-4 px-4 sm:space-x-6 sm:px-6 md:px-12 lg:px-16 pb-6"
              style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
            >
              {cards.map((item: any, index: number) => (
                <div
                  key={item?.id || index}
                  // Responsive card container widths
                  className="min-w-[85%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[280px] xl:min-w-[320px] flex-shrink-0"
                >
                  <Card
                    title={item?.title || ''}
                    description={item?.description || ''}
                    iconUrl={item?.iconUrl}
                    imageUrl={item?.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          {showNavigationButtons && (
            <div className="flex items-center mt-6 sm:mt-8">
              <div className="flex-grow border-t border-dashed border-gray-300 mr-4 sm:mr-6"></div>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => handleScroll('left')}
                  disabled={currentScrollLeft <= 1}
                  className="w-12 h-12 rounded-full bg-[#1f2937] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-[#374151] shadow-lg"
                  aria-label="Scroll left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                  disabled={currentScrollLeft >= maxScroll - 1}
                  className="w-12 h-12 rounded-full bg-[#1f2937] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-[#374151] shadow-lg"
                  aria-label="Scroll right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
