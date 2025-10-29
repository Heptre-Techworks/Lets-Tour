'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Card component
const Card: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex-shrink-0 w-64 h-80 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between m-4">
    <div>
      {/* Card title: NATS 24px, 24px line-height, -0.011em */}
      <h3 className="font-nats text-[24px] leading-[24px] tracking-[-0.011em] text-gray-800 mb-2">
        {title}
      </h3>
      {/* Card body: NATS 24px, 24px line-height, -0.011em */}
      <p className="font-nats text-[24px] leading-[24px] tracking-[-0.011em] text-gray-600">
        {description}
      </p>
    </div>
  </div>
);

// ✅ Define client props separately (without blockType requirement)
type FeatureCarouselClientProps = {
  dataSource?: string
  featureSource?: string
  heading?: string
  subheading?: string
  cards?: Array<{ title?: string; description?: string }>
  showNavigationButtons?: boolean
  scrollPercentage?: number
}

// Main component
export const FeatureCarouselClient: React.FC<FeatureCarouselClientProps> = ({
  dataSource = 'manual',
  featureSource = 'highlights',
  heading: initialHeading = 'Discover Our Features',
  subheading: initialSubheading = 'Explore the powerful tools that make our platform the best choice for you.',
  cards: initialCards = [],
  showNavigationButtons = true,
  scrollPercentage = 80,
}) => {
  const pathname = usePathname()
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  
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
    return () => { document.head.removeChild(style) }
  }, [])

  // ✅ Auto-fetch package data from URL
  useEffect(() => {
    const fetchPackageData = async () => {
      if (dataSource !== 'auto') return
      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'packages') { setLoading(false); return }
      const packageSlug = segments[1]
      if (!packageSlug) { setLoading(false); return }

      try {
        const response = await fetch(`/api/packages?where[slug][equals]=${packageSlug}&depth=2&limit=1`)
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
        const container = containerRef.current;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        setContainerWidth(clientWidth);
        setMaxScroll(scrollWidth - clientWidth);
      }
    };
    calculateWidths();
    window.addEventListener('resize', calculateWidths);
    return () => {
      window.removeEventListener('resize', calculateWidths);
    };
  }, [cards]);

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = containerWidth * ((scrollPercentage || 80) / 100);
    let newScrollPosition =
      direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;
    newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll));
    setScrollPosition(newScrollPosition);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center font-sans py-12">
        <div className="text-center text-gray-500">
          Loading features...
        </div>
      </div>
    )
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-center font-sans py-12">
      <div className="w-full px-8 md:px-16">
        {/* Header section */}
        <div className="text-left mb-8">
          <div className="flex items-center">
            {/* Heading: Amiri italic 64px, 88%, -0.011em */}
            <h1 className="font-amiri italic font-bold text-[64px] leading-[0.88] tracking-[-0.011em] text-gray-900 whitespace-nowrap pr-6">
              {heading}
            </h1>
            <div className="w-full border-t border-dashed border-gray-400"></div>
          </div>
          {/* Subheading: NATS 26px, 88%, -0.011em */}
          {subheading && (
            <p className="font-nats text-[26px] leading-[0.88] tracking-[-0.011em] text-gray-900 mt-2">
              {subheading}
            </p>
          )}
        </div>

        {/* Carousel section */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#08121E] -z-10"></div>
          
          <div className="overflow-hidden py-4">
            <div
              ref={containerRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {cards.map((item: any, index: number) => (
                <Card key={item?.id || index} title={item?.title || ''} description={item?.description || ''} />
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          {showNavigationButtons && (
            <div className="flex items-center mt-8">
              <div className="flex-grow border-t border-dashed border-gray-400 mr-6"></div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleScroll('left')}
                  disabled={scrollPosition === 0}
                  className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  disabled={scrollPosition >= maxScroll - 1}
                  className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions (same as server-side)
function transformPackageToCards(pkg: any, source: string): Array<{ title: string; description: string }> {
  switch (source) {
    case 'highlights':
      return (pkg.highlights || []).map((h: any) => ({
        title: h.text || '',
        description: h.text || '',
      }))
    
    case 'inclusions':
      return (pkg.inclusions || []).map((inc: any) => {
        const inclusion = typeof inc === 'object' ? inc : null
        return {
          title: inclusion?.name || inclusion?.title || 'Inclusion',
          description: inclusion?.description || inclusion?.summary || '',
        }
      })
    
    case 'activities':
      return (pkg.activities || []).map((act: any) => {
        const activity = typeof act === 'object' ? act : null
        return {
          title: activity?.name || activity?.title || 'Activity',
          description: activity?.description || activity?.summary || '',
        }
      })
    
    case 'amenities':
      return (pkg.amenities || []).map((am: any) => {
        const amenity = typeof am === 'object' ? am : null
        return {
          title: amenity?.name || amenity?.title || 'Amenity',
          description: amenity?.description || amenity?.summary || '',
        }
      })
    
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

export default FeatureCarouselClient;
