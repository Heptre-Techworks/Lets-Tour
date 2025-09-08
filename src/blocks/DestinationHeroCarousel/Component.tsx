// components/blocks/DestinationHeroCarousel.tsx
'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Media {
  url: string
  alt?: string
}

interface Stop {
  id?: string
  name: string
  city: string
  image: Media | string
  excerpt: string
  slug?: string
}

interface DisplaySettings {
  showActiveScale?: boolean
  visibleWindow?: number
}

interface DestinationHeroCarouselProps {
  title?: string
  stops?: Stop[]
  displaySettings?: DisplaySettings
}

export const DestinationHeroCarousel: React.FC<DestinationHeroCarouselProps> = ({
  title = 'Things to do in Spain',
  stops = [],
  displaySettings = {
    showActiveScale: true,
    visibleWindow: 3,
  },
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(3)

  const getImageUrl = (image: Media | string | undefined): string => {
    if (!image) return '/placeholder-image.jpg'
    return typeof image === 'string' ? image : image.url
  }

  // Add IDs to stops if they don't exist
  const processedStops = useMemo(
    () =>
      stops.map((stop, index) => ({
        ...stop,
        id: stop.slug || `stop-${index}`,
      })),
    [stops]
  )

  // Calculate the maximum scroll index
  const maxIndex = Math.max(0, processedStops.length - visibleCards)

  // Scroll functions
  const scrollLeft = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const scrollRight = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  // Get current visible stops (synced with cards)
  const visibleStops = useMemo(
    () => processedStops.slice(currentIndex, currentIndex + visibleCards),
    [processedStops, currentIndex, visibleCards]
  )

  // Compute arc positions for the 3 planes: left, center, right
  const pathPositions = useMemo(() => [0.25, 0.5, 0.75], [])

  if (processedStops.length === 0) {
    return (
      <div className="w-full py-8 px-4 text-center text-gray-500">
        No destinations available
      </div>
    )
  }

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mt-4 mb-6">
        {title}
      </h1>

      {/* Arc with 3 planes + labels matching visibleStops */}
      <div className="relative w-full" style={{ height: '320px' }}>
        {/* Arc */}
        <svg
          className="absolute inset-x-0 -top-4 h-[340px] w-[2000px] max-w-none left-1/2 -translate-x-1/2 pointer-events-none"
          viewBox="0 0 2000 340"
          fill="none"
        >
          <path
            id="flight-arc"
            d="M20 320 C 600 -40, 1400 -40, 1980 320"
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeDasharray="6 8"
            fill="none"
          />
        </svg>

        {/* Animated Planes + labels synced with cards */}
        <svg
          className="absolute inset-x-0 -top-4 h-[340px] w-[2000px] max-w-none left-1/2 -translate-x-1/2"
          viewBox="0 0 2000 340"
        >
          <defs>
            <path id="arcPath" d="M20 320 C 600 -40, 1400 -40, 1980 320" />
          </defs>
          {visibleStops.map((stop, localIdx) => (
            <g key={`${stop.id}-${currentIndex}`}>
              <foreignObject x="0" y="0" width="2000" height="340">
                <div
                  style={{
                    offsetPath: "path('M20 320 C 600 -40, 1400 -40, 1980 320')",
                    offsetRotate: 'auto 90deg',
                    offsetDistance: `${pathPositions[localIdx] * 100}%`,
                    transition: 'offset-distance 0.5s ease-out, transform 0.5s ease-out',
                  }}
                  className="absolute"
                >
                  <div className="flex items-center gap-2 translate-y-[-6px]">
                    <PlaneIcon
                      className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-500 ${
                        localIdx === 1 
                          ? 'text-black scale-110' 
                          : 'text-gray-800 scale-100'
                      }`}
                    />
                    <div
                      className={`px-3 py-1.5 rounded-full bg-white border text-xs md:text-sm whitespace-nowrap transition-all duration-500 ${
                        localIdx === 1
                          ? 'border-gray-300 shadow-md scale-105 font-semibold'
                          : 'border-gray-200/70 shadow-sm opacity-90 scale-100'
                      }`}
                    >
                      {stop.name}, {stop.city}
                    </div>
                  </div>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>

      {/* Navigation Controls + Cards */}
      <div className="relative mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-center justify-between">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="w-[50px] h-[50px] bg-gray-300/75 rounded-full shadow-lg opacity-50 hover:opacity-75 transition-opacity z-10 disabled:opacity-25"
            aria-label="Previous destinations"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>

          {/* Cards Container */}
          <div className="flex-1 mx-8 overflow-hidden">
            <div
              ref={containerRef}
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 310}px)`,
              }}
            >
              {processedStops.map((stop, idx) => {
                // Determine if this card is in the center position
                const relativePosition = idx - currentIndex
                const isCenter = relativePosition === 1 && visibleCards === 3
                const isVisible = relativePosition >= 0 && relativePosition < visibleCards
                
                return (
                  <div
                    key={stop.id}
                    className={`shrink-0 transition-all duration-500 ease-out ${
                      isCenter && displaySettings.showActiveScale
                        ? 'w-[350px] h-[450px] scale-105 z-10'
                        : 'w-[286px] h-[386px] z-0'
                    } ${isVisible ? 'opacity-100' : 'opacity-60'}`}
                  >
                    <article className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-[0_6px_18px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow duration-300 h-full">
                      <div className={`w-full overflow-hidden transition-all duration-500 ${isCenter ? 'h-56 md:h-64' : 'h-40 md:h-56'}`}>
                        <img
                          src={getImageUrl(stop.image)}
                          alt={`${stop.name}, ${stop.city}`}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                          draggable={false}
                        />
                      </div>
                      
                      <div className="bg-orange-400 text-white px-4 py-3">
                        <h3 className={`font-serif italic transition-all duration-500 ${isCenter ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
                          {stop.name}
                        </h3>
                      </div>
                      
                      <div className="px-4 py-3 text-gray-700 transition-all duration-500">
                        <p className={isCenter ? 'text-sm md:text-base' : 'text-[13px] md:text-sm'}>
                          {stop.excerpt}
                        </p>
                        <p className="mt-2 text-[12px] text-gray-500">
                          {stop.city}, Spain
                        </p>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRight}
            disabled={currentIndex >= maxIndex}
            className="w-[50px] h-[50px] bg-gray-300/75 rounded-full shadow-lg opacity-50 hover:opacity-75 transition-opacity z-10 disabled:opacity-25"
            aria-label="Next destinations"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-orange-400 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

/* Plane icon */
function PlaneIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V20l-2 1.5V23l3-1 3 1v-1.5L13 20v-6.5l8 2.5Z" />
    </svg>
  )
}

export default DestinationHeroCarousel
