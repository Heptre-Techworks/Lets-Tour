'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import type { Media, City as CityType, Destination } from '@/payload-types'

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
  autoplayInterval?: number
  destination?: Destination
}

export const DestinationHero: React.FC<DestinationHeroProps> = ({
  autoplayInterval = 5000,
  destination: destinationProp,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const cityListRef = useRef<HTMLUListElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isJumpingRef = useRef(false)

  const [destination, setDestination] = useState<Destination | null>(destinationProp || null)
  const [loading, setLoading] = useState(!destinationProp)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (destinationProp) return

    const fetchDestination = async () => {
      const pathSegments = pathname.split('/')
      const destIndex = pathSegments.indexOf('destinations')
      const slug = destIndex !== -1 ? pathSegments[destIndex + 1] : null

      if (!slug) {
        setError('No destination slug found in URL')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/destinations?where[slug][equals]=${slug}&depth=2`)
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        const data = await response.json()
        if (data.docs && data.docs[0]) {
          setDestination(data.docs[0])
        } else {
          setError(`Destination not found: ${slug}`)
        }
      } catch (err) {
        setError(`Error fetching destination: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [pathname, destinationProp])

  const cities: City[] = React.useMemo(() => {
    if (!destination?.cities || !Array.isArray(destination.cities)) return []
    return destination.cities
      .filter((city): city is CityType => typeof city === 'object')
      .map((city) => ({
        name: city.name,
        image: (city.heroImage || city.featuredImage || '') as Media | string,
        id: city.id,
      }))
      .filter((city) => !!city.image)
  }, [destination?.cities])

  const destinationName = destination?.name || ''
  const extendedCities = [...cities, ...cities, ...cities]
  const initialDisplayIndex = cities.length
  const [displayIndex, setDisplayIndex] = useState(initialDisplayIndex)
  const activeCityIndex = displayIndex % cities.length

  const getImageUrl = (image: Media | string): string =>
    typeof image === 'string' ? image : image?.url || ''

  const resetAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDisplayIndex((prev) => prev + 1)
    }, autoplayInterval)
  }

  const handleUserInteraction = (index: number) => {
    isJumpingRef.current = false
    setDisplayIndex(index)
    resetAutoplay()
  }

  useEffect(() => setHeaderTheme('dark'), [setHeaderTheme])

  useEffect(() => {
    if (cities.length > 0) resetAutoplay()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoplayInterval, cities.length])

  useEffect(() => {
    const activeCityElement = cityListRef.current?.children[displayIndex] as HTMLElement
    const scrollContainer = containerRef.current
    if (activeCityElement && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const elementRect = activeCityElement.getBoundingClientRect()
      const scrollLeft = scrollContainer.scrollLeft
      const elementCenter = elementRect.left - containerRect.left + elementRect.width / 2
      const containerCenter = containerRect.width / 2
      const targetScrollLeft = scrollLeft + elementCenter - containerCenter
      scrollContainer.scrollTo({
        left: targetScrollLeft,
        behavior: isJumpingRef.current ? 'auto' : 'smooth',
      })
      isJumpingRef.current = false
    }
  }, [displayIndex])

  useEffect(() => {
    const scrollAnimationTime = 500
    let jumpTimeout: NodeJS.Timeout
    const isAtEnd = displayIndex >= cities.length * 2
    const isAtStart = displayIndex < cities.length
    if ((isAtEnd || isAtStart) && cities.length > 0) {
      jumpTimeout = setTimeout(() => {
        isJumpingRef.current = true
        const newIndex = (displayIndex % cities.length) + cities.length
        setDisplayIndex(newIndex)
      }, scrollAnimationTime)
    }
    return () => clearTimeout(jumpTimeout)
  }, [displayIndex, cities.length])

  if (loading)
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading destination...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">❌ {error}</p>
        </div>
      </div>
    )

  if (!destination)
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>No destination data available</p>
      </div>
    )

  if (cities.length === 0)
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">{destinationName}</h1>
          <p className="text-gray-400">No cities available for this destination.</p>
        </div>
      </div>
    )

  return (
    <section
      className="relative -mt-[10.4rem] w-full h-screen bg-gray-900 font-sans antialiased overflow-hidden"
      data-theme="dark"
    >
      {/* Fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;1,700&display=swap');
        .font-amiri {
          font-family: 'Amiri', serif;
        }
        .font-nats {
          font-family:
            'NATS',
            ui-sans-serif,
            system-ui,
            -apple-system,
            'Segoe UI',
            Roboto,
            'Helvetica Neue',
            Arial,
            'Noto Sans';
        }
      `}</style>

      <div
        key={activeCityIndex}
        style={{ backgroundImage: `url(${getImageUrl(cities[activeCityIndex].image)})` }}
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      <div className="relative w-full h-full flex flex-col justify-end text-white px-4 sm:px-6 md:px-12  sm:pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
          <h1
            className="font-amiri italic text-[2.2rem] sm:text-[3.5rem] md:text-[6rem] leading-tight tracking-[-0.011em] capitalize text-center md:text-left w-full"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}
          >
            {destinationName}
          </h1>

          {/* Navigation Bar */}
          <nav className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-2 sm:gap-4 text-gray-200 w-full md:w-auto">
            {/* Prev Button */}
            <button
              onClick={() => handleUserInteraction(displayIndex - 1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 hidden sm:block"
              aria-label="Previous city"
            >
              <ArrowIcon className="w-5 h-5" />
            </button>

            {/* City Scroll */}
            <div
              ref={containerRef}
              className="overflow-x-auto scrollbar-hide max-w-full sm:max-w-[70vw] md:max-w-lg mx-auto sm:mx-0"
            >
              <ul
                ref={cityListRef}
                className="flex items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base md:text-lg px-6 sm:px-12 md:px-16"
              >
                {extendedCities.map((city, index) => (
                  <li key={`${city.name}-${index}`}>
                    <a
                      href={`#${city.name.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleUserInteraction(index)
                      }}
                      className={`font-nats text-[18px] sm:text-[22px] md:text-[24px] py-1 transition-all duration-300 ${
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

            {/* Next Button */}
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

export default DestinationHero
