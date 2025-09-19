'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Destination = {
  id: string
  slug: string
  name: string
  country: string
  continent: string
  locationDetails?: string
  heroImage: {
    url: string
    alt?: string
  }
  packageCount?: number
  startingPrice?: number
  discount?: {
    percentage?: number
    label?: string
  }
}

type CardSize = 'small' | 'medium' | 'large' | 'xl'

type Props = {
  title?: string
  subtitle?: string
  destinations?: Destination[]
  showDiscountBadge?: boolean
  showLocationDetails?: boolean
  cardSizePattern?: 'varied' | 'pattern' | 'random'
  backgroundColor?: 'gray' | 'white' | 'cream'
}

export const NonUniformCardCarousel: React.FC<Props> = ({
  title = 'In Season',
  subtitle = "Today's enemy is tomorrow's friend.",
  destinations = [],
  showDiscountBadge = true,
  showLocationDetails = true,
  cardSizePattern = 'varied',
  backgroundColor = 'gray',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentScrollX, setCurrentScrollX] = useState(0)
  const [maxScrollX, setMaxScrollX] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const destinationsWithSizes = useMemo(() => {
    if (destinations.length === 0) return []
    return destinations.map((dest, index) => {
      let size: CardSize
      switch (cardSizePattern) {
        case 'pattern': {
          const patternIndex = index % 4
          size =
            patternIndex === 0
              ? 'large'
              : patternIndex === 1 || patternIndex === 3
              ? 'medium'
              : 'small'
          break
        }
        case 'random': {
          const sizes: CardSize[] = ['small', 'medium', 'large', 'xl']
          size = sizes[Math.floor(Math.random() * sizes.length)]
          break
        }
        case 'varied':
        default:
          if (index === 0 || index % 5 === 0) size = 'xl'
          else if (index % 3 === 0) size = 'large'
          else if (index % 2 === 0) size = 'medium'
          else size = 'small'
          break
      }
      return { ...dest, size }
    })
  }, [destinations, cardSizePattern])

  const getCardDimensions = (size: CardSize) => {
    switch (size) {
      case 'xl':
        return { width: 380, height: 320 }
      case 'large':
        return { width: 320, height: 280 }
      case 'medium':
        return { width: 280, height: 240 }
      case 'small':
        return { width: 240, height: 200 }
      default:
        return { width: 280, height: 240 }
    }
  }

  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case 'white':
        return 'bg-white'
      case 'cream':
        return 'bg-amber-50'
      case 'gray':
      default:
        return 'bg-gray-50'
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      setMaxScrollX(container.scrollWidth - container.clientWidth)
    }
  }, [destinationsWithSizes])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const newScrollX = Math.max(currentScrollX - scrollAmount, 0)
      scrollContainerRef.current.scrollTo({ left: newScrollX, behavior: 'smooth' })
      setCurrentScrollX(newScrollX)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const newScrollX = Math.min(currentScrollX + scrollAmount, maxScrollX)
      scrollContainerRef.current.scrollTo({ left: newScrollX, behavior: 'smooth' })
      setCurrentScrollX(newScrollX)
    }
  }

  useEffect(() => {
    if (isHovered || maxScrollX === 0) return
    const interval = setInterval(() => {
      setCurrentScrollX((prev) => {
        const newScrollX = prev >= maxScrollX ? 0 : prev + 320
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ left: newScrollX, behavior: 'smooth' })
        }
        return newScrollX
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [isHovered, maxScrollX])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setCurrentScrollX(scrollContainerRef.current.scrollLeft)
    }
  }

  if (destinationsWithSizes.length === 0) {
    return null
  }

  return (
    <section className={`py-16 ${getBackgroundClass()}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-3">
            {title}
          </h1>
          {subtitle && <p className="text-gray-700 text-lg">&quot;{subtitle}&quot;</p>}
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={currentScrollX === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous destinations"
          >
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="mx-20 overflow-hidden">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto scrollbar-hide items-end pb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {destinationsWithSizes.map((destination) => {
                const { width, height } = getCardDimensions(destination.size)

                return (
                  <Link
                    key={destination.id}
                    href={`/destinations/${destination.slug}`}
                    className="group flex-shrink-0"
                    style={{ width: `${width}px` }}
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                      {/* Image */}
                      <div className="relative" style={{ height: `${height}px` }}>
                        <Image
                          src={destination.heroImage?.url || ''}
                          alt={destination.heroImage?.alt || destination.name}
                          fill
                          sizes={`${width}px`}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Discount Badge */}
                        {showDiscountBadge && destination.discount && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-orange-400 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow-md">
                              {destination.discount.label || `${destination.discount.percentage}% Off`}
                            </span>
                          </div>
                        )}

                        {/* Heart Icon */}
                        <div className="absolute top-4 right-4">
                          <button
                            className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-40 transition-all duration-200"
                            onClick={(e) => {
                              e.preventDefault()
                              // Add to favorites logic
                            }}
                            aria-label="Add to favorites"
                          >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <h2
                            className={`font-serif text-white mb-2 italic font-medium ${
                              destination.size === 'xl'
                                ? 'text-3xl'
                                : destination.size === 'large'
                                ? 'text-2xl'
                                : destination.size === 'medium'
                                ? 'text-xl'
                                : 'text-lg'
                            }`}
                          >
                            {destination.name}
                          </h2>

                          {showLocationDetails &&
                            destination.locationDetails &&
                            destination.size !== 'small' && (
                              <p className="text-white text-sm opacity-90 mb-3 leading-relaxed">
                                {destination.locationDetails.length > 50 &&
                                destination.size === 'medium'
                                  ? `${destination.locationDetails.substring(0, 50)}...`
                                  : destination.locationDetails}
                              </p>
                            )}

                          {/* Price */}
                          {destination.startingPrice && (
                            <div className="flex items-center justify-between">
                              <div className="text-white">
                                <p
                                  className={`font-bold ${
                                    destination.size === 'xl'
                                      ? 'text-2xl'
                                      : destination.size === 'large'
                                      ? 'text-xl'
                                      : 'text-lg'
                                  }`}
                                >
                                  ₹{destination.startingPrice.toLocaleString()}
                                  <span className="text-sm font-normal opacity-90 ml-1">
                                    (per person)
                                  </span>
                                </p>
                              </div>

                              {/* Action Arrow */}
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={currentScrollX >= maxScrollX}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next destinations"
          >
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <div className="mt-8 mx-20">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gray-800 h-1 rounded-full transition-all duration-300"
              style={{ width: `${maxScrollX > 0 ? (currentScrollX / maxScrollX) * 100 : 0}%` }}
            />
          </div>
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

export default NonUniformCardCarousel
