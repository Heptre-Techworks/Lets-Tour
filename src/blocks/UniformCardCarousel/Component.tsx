// components/blocks/UniformCardCarousel.tsx
'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

type Destination = {
  id: string
  slug: string
  name: string
  country: string
  continent: string
  labels?: string[] // ['In Season', 'Popular']
  heroImage: {
    url: string
    alt?: string
  }
  packageCount?: number
  startingPrice?: number
}

type Props = {
  title?: string
  subtitle?: string
  destinations?: Destination[]
  cardStyle?: 'rounded' | 'sharp'
  showLabels?: boolean
  showPricing?: boolean
  cardsPerView?: 3 | 4 | 5
  autoScroll?: boolean
  autoScrollInterval?: number
}

export const UniformCardCarousel: React.FC<Props> = ({
  title = 'Uniform Card Carousel',
  subtitle = "Today's enemy is tomorrow's friend.",
  destinations = [],
  cardStyle = 'rounded',
  showLabels = true,
  showPricing = true,
  cardsPerView = 4,
  autoScroll = false,
  autoScrollInterval = 3000,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const cardWidth = 300
  const gap = 20
  const maxIndex = Math.max(0, destinations.length - cardsPerView)

  // Auto scroll functionality
  useEffect(() => {
    if (!autoScroll || isHovered || destinations.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: newIndex * (cardWidth + gap),
            behavior: 'smooth',
          })
        }
        return newIndex
      })
    }, autoScrollInterval)

    return () => clearInterval(interval)
  }, [autoScroll, autoScrollInterval, isHovered, maxIndex, cardWidth, gap, destinations.length])

  const scrollLeft = () => {
    const newIndex = Math.max(currentIndex - 1, 0)
    setCurrentIndex(newIndex)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: newIndex * (cardWidth + gap),
        behavior: 'smooth',
      })
    }
  }

  const scrollRight = () => {
    const newIndex = Math.min(currentIndex + 1, maxIndex)
    setCurrentIndex(newIndex)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: newIndex * (cardWidth + gap),
        behavior: 'smooth',
      })
    }
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth',
      })
    }
  }

  const roundedClass = cardStyle === 'rounded' ? 'rounded-xl' : 'rounded-none'

  if (destinations.length === 0) {
    return (
      <section className="py-12 bg-orange-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No destinations available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-orange-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 italic">"{subtitle}"</p>
          )}
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
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous destinations"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards Container */}
          <div className="mx-16 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-5 transition-transform duration-300 ease-in-out"
              style={{ 
                scrollBehavior: 'smooth',
                width: `${destinations.length * (cardWidth + gap)}px`
              }}
            >
              {destinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="group flex-shrink-0"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className={`relative ${roundedClass} overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white transform hover:-translate-y-1`}>
                    {/* Image */}
                    <div className="relative h-52">
                      <img
                        src={destination.heroImage.url}
                        alt={destination.heroImage.alt || destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Labels */}
                      {showLabels && destination.labels && destination.labels.length > 0 && (
                        <div className="absolute top-3 left-3 flex gap-2">
                          {destination.labels.map((label, labelIndex) => (
                            <span
                              key={labelIndex}
                              className={`px-3 py-1 text-xs font-semibold text-white rounded-full shadow-md ${
                                label.toLowerCase().includes('popular') 
                                  ? 'bg-red-500' 
                                  : 'bg-orange-400'
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Heart Icon */}
                      <div className="absolute top-3 right-3">
                        <button 
                          className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-40 transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault()
                            // Add to favorites logic here
                          }}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Destination Name & Price Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                        <h3 className="text-xl font-serif text-white mb-1 italic font-medium">
                          {destination.name}
                        </h3>
                        {showPricing && destination.startingPrice && (
                          <div className="text-white">
                            <p className="text-sm opacity-90">Packages starting at</p>
                            <p className="text-lg font-bold">
                              ₹{destination.startingPrice.toLocaleString()}
                              <span className="text-sm font-normal opacity-90">/person</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next destinations"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dots Indicator & Pagination */}
        <div className="mt-8 flex items-center justify-between">
          {/* Dots Indicator */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  currentIndex === index
                    ? 'w-8 bg-gray-800'
                    : 'w-2 bg-gray-400 hover:bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Pagination Counter */}
          <div className="text-right">
            <span className="text-gray-700 font-semibold text-lg">
              {Math.min(currentIndex + cardsPerView, destinations.length)} / {destinations.length}
            </span>
          </div>
        </div>

        {/* Auto-scroll indicator */}
        {autoScroll && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {isHovered ? 'Auto-scroll paused' : 'Auto-scrolling...'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default UniformCardCarousel
