// components/blocks/UniformCardCarousel.tsx
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

interface UniformCardCarouselProps {
  title?: string
  subtitle?: string
  destinations?: Destination[]
  showNavigation?: boolean
}

export const UniformCardCarousel: React.FC<UniformCardCarouselProps> = ({
  title = 'In Season',
  subtitle = "Today's enemy is tomorrow's friend.",
  destinations = [],
  showNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Fix hydration issue by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const getImageUrl = (image: Media | string | undefined): string | null => {
    if (!image) return null
    return typeof image === 'string' ? image : image.url
  }

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '₹ 117,927'
    return `₹ ${price.toLocaleString('en-IN')}`
  }

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (currentIndex < destinations.length - 4) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const validDestinations = destinations.filter(dest => 
    dest && getImageUrl(dest.heroImage) !== null
  )

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
          <div className="flex gap-6 overflow-hidden flex-1 mx-8">
            {validDestinations.map((destination, index) => {
              const heroImageUrl = getImageUrl(destination.heroImage)
              
              return (
                <Card
                  key={`${destination.slug}-${index}`}
                  className="relative w-[286px] h-[386px] flex-shrink-0 overflow-hidden rounded-xl border-0 bg-transparent"
                >
                  <CardContent className="p-0 relative h-full">
                    <div className="relative w-full h-full">
                      {heroImageUrl && (
                        <>
                          <img
                            className="absolute w-full h-[375px] top-0 left-0 rounded-xl object-cover"
                            alt="Background"
                            src={heroImageUrl}
                          />
                          <img
                            className="absolute w-full h-[383px] top-0 left-0 rounded-xl object-cover"
                            alt={destination.name}
                            src={heroImageUrl}
                          />
                        </>
                      )}
                      <div className="absolute w-full h-[375px] top-0 left-0 rounded-xl bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_40%,rgba(120,119,120,0)_100%)]" />
                    </div>
                    
                    {/* Fixed Badge with hydration suppression */}
                    <div suppressHydrationWarning>
                      {isClient && destination.featured && (
                        <Badge className="absolute top-5 left-5 bg-orange-400 hover:bg-orange-500 text-white border-0 rounded-lg px-3 py-1">
                          <span className="font-normal text-lg tracking-tight">
                            Featured
                          </span>
                        </Badge>
                      )}
                      {isClient && !destination.featured && (
                        <Badge className="absolute top-5 left-5 bg-[#fbae3d] hover:bg-[#fbae3d] text-white border-0 rounded-lg px-3 py-1">
                          <span className="[font-family:'NATS-Regular',Helvetica] font-normal text-lg tracking-[-0.20px] leading-[15.8px]">
                            10% Off
                          </span>
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-5 right-5 w-6 h-6 p-0 hover:bg-transparent"
                    >
                      <HeartIcon className="w-6 h-6 text-white" />
                    </Button>
                    <div className="absolute bottom-12 left-5 right-5">
                      <h3 className="[font-family:'Amiri',Helvetica] font-normal italic text-white text-[40px] tracking-[-0.44px] leading-[35.2px] mb-3">
                        {destination.name}
                      </h3>
                      <p className="[font-family:'NATS-Regular',Helvetica] font-normal text-white text-base tracking-[-0.18px] leading-[14.1px] mb-6">
                        {destination.shortDescription || `${destination.country} - Experience the beauty and culture`}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <img
                            className="w-[235px] h-px object-cover mb-4"
                            alt="Vector"
                            src="/vector-1.svg"
                          />
                          <div className="[font-family:'NATS-Regular',Helvetica] font-normal text-white text-[32px] tracking-[-0.35px] leading-[28.2px]">
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
                          <Button className="w-[50px] h-[50px] bg-[#1e1e1e] hover:bg-[#1e1e1e]/80 rounded-[25px] p-0">
                            <div className="w-10 h-10 bg-white rounded-[20px] flex items-center justify-center">
                              <img
                                className="w-[21px] h-[15px]"
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
              disabled={currentIndex >= validDestinations.length - 4}
              className="w-[50px] h-[50px] bg-[#ecececbf] rounded-[25px] shadow-[0px_4px_4px_#00000040] opacity-50 hover:opacity-75 transition-opacity z-10"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export default UniformCardCarousel
