// components/blocks/EnlargingCardCarousel.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface Media {
  url: string
  alt?: string
}

interface Destination {
  name: string
  slug: string
  country: string
  shortDescription?: string
  featured?: boolean
  heroImage?: Media | string
  startingPrice?: number
}

interface EnlargingCardCarouselProps {
  title?: string
  subtitle?: string
  destinations?: Destination[]
  showNavigation?: boolean
  autoPlay?: boolean
  enlargeOnHover?: boolean
}

export const EnlargingCardCarousel: React.FC<EnlargingCardCarouselProps> = ({
  title = 'Explore Destinations',
  subtitle = 'Discover amazing places around the world',
  destinations = [],
  showNavigation = true,
  autoPlay = false,
  enlargeOnHover = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const getImageUrl = (image: Media | string | undefined): string | null => {
    if (!image) return null
    return typeof image === 'string' ? image : image.url
  }

  // Move validDestinations declaration BEFORE useEffect
  const validDestinations = destinations.filter(dest => 
    dest && getImageUrl(dest.heroImage) !== null
  )

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto play functionality - now validDestinations is available
  useEffect(() => {
    if (autoPlay && isClient && validDestinations.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => 
          prev >= validDestinations.length - 1 ? 0 : prev + 1
        )
      }, 4000)

      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current)
        }
      }
    }
  }, [autoPlay, isClient, validDestinations.length])

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '₹ 117,927'
    return `₹ ${price.toLocaleString('en-IN')}`
  }

  const scrollLeft = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    if (currentIndex < validDestinations.length - 3) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (validDestinations.length === 0) {
    return (
      <div className="w-full py-8 px-4 text-center text-gray-500">
        No destinations available
      </div>
    )
  }

  return (
    <section className="w-full py-8 px-4">
      <header className="mb-8 px-16">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="[font-family:'Amiri',Helvetica] font-bold italic text-black text-[64px] tracking-[-0.70px] leading-[56.3px] whitespace-nowrap">
            {title}
          </h2>
          <div className="flex-1 h-px bg-black/20">
            <img
              className="w-full h-px object-cover"
              alt="Line"
              src="/line-6-1.svg"
            />
          </div>
        </div>
        <p className="[font-family:'NATS-Regular',Helvetica] font-normal text-black text-[26px] tracking-[-0.29px] leading-[22.9px]">
          {subtitle}
        </p>
      </header>
      
      <div className="relative px-16">
        <div className="flex items-center justify-between">
          {showNavigation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className="w-[50px] h-[50px] bg-[#ecececbf] rounded-[25px] shadow-[0px_4px_4px_#00000040] opacity-50 hover:opacity-75 transition-opacity z-10"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Button>
          )}
          
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-hidden flex-1 mx-8"
            style={{
              transform: `translateX(-${currentIndex * 310}px)`,
              transition: 'transform 0.5s ease-in-out'
            }}
          >
            {validDestinations.map((destination, index) => {
              const heroImageUrl = getImageUrl(destination.heroImage)
              const isHovered = hoveredIndex === index
              const isCenter = Math.abs(index - currentIndex - 1) < 1
              
              return (
                <Card
                  key={`${destination.slug}-${index}`}
                  className={`relative flex-shrink-0 overflow-hidden rounded-xl border-0 bg-transparent group cursor-pointer transition-all duration-500 ${
                    enlargeOnHover && isHovered 
                      ? 'w-[350px] h-[450px] z-20 shadow-2xl' 
                      : isCenter && enlargeOnHover
                      ? 'w-[320px] h-[420px] z-10 shadow-lg'
                      : 'w-[286px] h-[386px] z-0'
                  }`}
                  onMouseEnter={() => enlargeOnHover && setHoveredIndex(index)}
                  onMouseLeave={() => enlargeOnHover && setHoveredIndex(null)}
                >
                  <CardContent className="p-0 relative h-full">
                    <div className="relative w-full h-full">
                      {heroImageUrl && (
                        <>
                          <img
                            className="absolute w-full h-[90%] top-0 left-0 rounded-xl object-cover transition-all duration-500"
                            alt="Background"
                            src={heroImageUrl}
                          />
                          <img
                            className={`absolute w-full h-[92%] top-0 left-0 rounded-xl object-cover transition-all duration-500 ${
                              isHovered ? 'scale-110' : 'scale-100'
                            }`}
                            alt={destination.name}
                            src={heroImageUrl}
                          />
                        </>
                      )}
                      <div className="absolute w-full h-[90%] top-0 left-0 rounded-xl bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_40%,rgba(120,119,120,0)_100%)]" />
                    </div>
                    
                    {/* Badge with hydration suppression */}
                    <div suppressHydrationWarning>
                      {isClient && (
                        <Badge className={`absolute top-5 left-5 bg-[#fbae3d] hover:bg-[#fbae3d] text-white border-0 rounded-lg px-3 py-1 transition-all duration-300 ${
                          isHovered ? 'scale-110' : 'scale-100'
                        }`}>
                          <span className="[font-family:'NATS-Regular',Helvetica] font-normal text-lg tracking-[-0.20px] leading-[15.8px]">
                            {destination.featured ? 'Featured' : '10% Off'}
                          </span>
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-5 right-5 w-6 h-6 p-0 hover:bg-transparent transition-all duration-300 ${
                        isHovered ? 'scale-125' : 'scale-100'
                      }`}
                    >
                      <HeartIcon className="w-6 h-6 text-white" />
                    </Button>
                    
                    <div className={`absolute left-5 right-5 transition-all duration-300 ${
                      isHovered ? 'bottom-8' : 'bottom-12'
                    }`}>
                      <h3 className={`[font-family:'Amiri',Helvetica] font-normal italic text-white mb-3 transition-all duration-300 ${
                        isHovered 
                          ? 'text-[44px] tracking-[-0.48px] leading-[38.7px]' 
                          : 'text-[40px] tracking-[-0.44px] leading-[35.2px]'
                      }`}>
                        {destination.name}
                      </h3>
                      
                      <p className={`[font-family:'NATS-Regular',Helvetica] font-normal text-white mb-6 transition-all duration-300 ${
                        isHovered 
                          ? 'text-lg tracking-[-0.20px] leading-[15.8px] opacity-100' 
                          : 'text-base tracking-[-0.18px] leading-[14.1px] opacity-90'
                      }`}>
                        {destination.shortDescription || `${destination.country} - Experience the beauty and culture`}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <img
                            className={`h-px object-cover mb-4 transition-all duration-300 ${
                              isHovered ? 'w-[280px]' : 'w-[235px]'
                            }`}
                            alt="Vector"
                            src="/vector-1.svg"
                          />
                          <div className={`[font-family:'NATS-Regular',Helvetica] font-normal text-white transition-all duration-300 ${
                            isHovered 
                              ? 'text-[36px] tracking-[-0.39px] leading-[31.7px]' 
                              : 'text-[32px] tracking-[-0.35px] leading-[28.2px]'
                          }`}>
                            <span className="tracking-[-0.11px]">
                              {formatPrice(destination.startingPrice)}
                            </span>
                            <span className="text-2xl tracking-[-0.06px] leading-[21.1px]">
                              &nbsp;
                            </span>
                            <span className="text-base tracking-[-0.03px] leading-[14.1px]">
                              (per person)
                            </span>
                          </div>
                        </div>
                        
                        <Link href={`/destinations/${destination.slug}`}>
                          <Button className={`bg-[#1e1e1e] hover:bg-[#1e1e1e]/80 rounded-[25px] p-0 transition-all duration-300 ${
                            isHovered ? 'w-[60px] h-[60px]' : 'w-[50px] h-[50px]'
                          }`}>
                            <div className={`bg-white rounded-[20px] flex items-center justify-center transition-all duration-300 ${
                              isHovered ? 'w-12 h-12' : 'w-10 h-10'
                            }`}>
                              <img
                                className={`transition-all duration-300 ${
                                  isHovered ? 'w-[25px] h-[18px]' : 'w-[21px] h-[15px]'
                                }`}
                                alt="Arrow"
                                src="/arrow-1.svg"
                              />
                            </div>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {showNavigation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollRight}
              disabled={currentIndex >= validDestinations.length - 3}
              className="w-[50px] h-[50px] bg-[#ecececbf] rounded-[25px] shadow-[0px_4px_4px_#00000040] opacity-50 hover:opacity-75 transition-opacity z-10"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </Button>
          )}
        </div>
        
        {/* Dot Indicators */}
        {isClient && validDestinations.length > 3 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: validDestinations.length - 2 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'bg-[#fbae3d] w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default EnlargingCardCarousel
