'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Media } from '@/payload-types'

// Helper component for the navigation arrows
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

type City = {
  name: string
  image: Media | string
  id?: string
}

type DestinationHeroProps = {
  cities: City[]
  autoplayInterval?: number
}

export const DestinationHero: React.FC<DestinationHeroProps> = ({
  cities,
  autoplayInterval = 5000,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const params = useParams<{ slug: string }>()
  const cityListRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isJumpingRef = useRef(false)

  // Extract destination from URL: /destinations/south-korea -> South Korea
  const getDestinationTitle = () => {
    const destinationParam = params?.slug
    
    if (!destinationParam) {
      return 'Destination'
    }
    
    // Handle both string and array (Next.js can return either)
    const slug = Array.isArray(destinationParam) ? destinationParam[0] : destinationParam
    
    // Convert slug to title: south-korea -> South Korea
    return slug
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  const destination = getDestinationTitle()
  // Create extended cities array for infinite loop illusion
  const extendedCities = [...cities, ...cities, ...cities]
  const initialDisplayIndex = cities.length // Start with first city in the middle block

  const [displayIndex, setDisplayIndex] = useState(initialDisplayIndex)

  // The actual active city index for the background image
  const activeCityIndex = displayIndex % cities.length

  // Helper to get image URL from Media object or string
  const getImageUrl = (image: Media | string): string => {
    if (typeof image === 'string') return image
    return image?.url || ''
  }

  // --- NAVIGATION & AUTOPLAY ---
  const resetAutoplay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setDisplayIndex((prevIndex) => prevIndex + 1)
    }, autoplayInterval)
  }

  const handleUserInteraction = (index: number) => {
    isJumpingRef.current = false
    setDisplayIndex(index)
    resetAutoplay()
  }

  // --- EFFECTS ---
  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    resetAutoplay()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [autoplayInterval])

  // Effect to scroll the active city into view WITHOUT scrolling the page
  useEffect(() => {
    const activeCityElement = cityListRef.current?.children[displayIndex] as HTMLElement
    const scrollContainer = containerRef.current
    
    if (activeCityElement && scrollContainer) {
      // Calculate the scroll position manually instead of using scrollIntoView
      const containerRect = scrollContainer.getBoundingClientRect()
      const elementRect = activeCityElement.getBoundingClientRect()
      
      // Calculate how much to scroll to center the element
      const scrollLeft = scrollContainer.scrollLeft
      const elementCenter = elementRect.left - containerRect.left + (elementRect.width / 2)
      const containerCenter = containerRect.width / 2
      const targetScrollLeft = scrollLeft + elementCenter - containerCenter
      
      // Use scrollTo instead of scrollIntoView to avoid page scroll
      scrollContainer.scrollTo({
        left: targetScrollLeft,
        behavior: isJumpingRef.current ? 'auto' : 'smooth',
      })
    }
    isJumpingRef.current = false
  }, [displayIndex])

  // Effect to handle the "jump" for the infinite loop illusion
  useEffect(() => {
    const scrollAnimationTime = 500
    let jumpTimeout: NodeJS.Timeout

    const isAtEnd = displayIndex >= cities.length * 2
    const isAtStart = displayIndex < cities.length

    if (isAtEnd || isAtStart) {
      jumpTimeout = setTimeout(() => {
        isJumpingRef.current = true
        const newIndex = (displayIndex % cities.length) + cities.length
        setDisplayIndex(newIndex)
      }, scrollAnimationTime)
    }

    return () => clearTimeout(jumpTimeout)
  }, [displayIndex, cities.length])

  return (
    <section
      className="relative -mt-[10.4rem] w-full h-screen bg-gray-900 font-sans antialiased overflow-hidden"
      data-theme="dark"
    >
      {/* Background Image */}
      <div
        key={activeCityIndex}
        style={{
          backgroundImage: `url(${getImageUrl(cities[activeCityIndex].image)})`,
        }}
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Main Content */}
      <div className="relative w-full h-full flex flex-col justify-end text-white p-6 sm:p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <h1
            className="text-7xl lg:text-9xl font-serif capitalize"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
          >
            {destination}
          </h1>

          {/* City Navigation */}
          <nav className="flex items-center justify-end gap-3 sm:gap-4 text-gray-200 w-full md:w-auto">
            <button
              onClick={() => handleUserInteraction(displayIndex - 1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 hidden sm:block"
              aria-label="Previous city"
            >
              <ArrowIcon className="w-5 h-5" />
            </button>
            <div
              ref={containerRef}
              className="overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[60vw] md:max-w-lg"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              }}
            >
              <ul
                ref={cityListRef}
                className="flex items-center justify-start gap-4 sm:gap-6 text-sm sm:text-base tracking-wider px-28 sm:px-48 md:px-64"
              >
                {extendedCities.map((city, index) => (
                  <li key={`${city.name}-${index}`}>
                    <a
                      href={`#${city.name.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleUserInteraction(index)
                      }}
                      className={`py-1 transition-all duration-300 text-lg ${
                        displayIndex === index
                          ? 'text-white scale-110 border-b-2 border-white font-semibold'
                          : 'text-gray-300 hover:text-white border-b-2 border-transparent'
                      }`}
                    >
                      {city.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleUserInteraction(displayIndex + 1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 hidden sm:block"
              aria-label="Next city"
            >
              <ArrowIcon className="w-5 h-5 rotate-180" />
            </button>
          </nav>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
