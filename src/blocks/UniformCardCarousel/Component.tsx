'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

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
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  const getImageUrl = (image: Media | string | undefined): string | null =>
    typeof image === 'string' ? image : (image?.url ?? null)

  const formatPrice = (price: number | undefined): string =>
    price ? `₹ ${price.toLocaleString('en-IN')}` : '₹ 117,927'

  const validDestinations = destinations.filter((dest) => dest && getImageUrl(dest.heroImage))

  if (!validDestinations.length)
    return (
      <div className="w-full py-8 px-4 text-center text-gray-500">No destinations available</div>
    )

  return (
    <section className="w-full py-10 px-4 sm:px-6 lg:px-16">
      {/* Header */}
      <header className="mb-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
          <h2 className="[font-family:'Amiri',Helvetica] font-bold italic text-black text-3xl sm:text-5xl md:text-6xl leading-tight">
            {title}
          </h2>
          <div className="hidden sm:block flex-1 h-px bg-black/20">
            <Image fill src="/line-6-1.svg" alt="Line" className="w-full h-px object-cover" />
          </div>
        </div>
        <p className="[font-family:'NATS-Regular',Helvetica] text-black text-sm sm:text-lg md:text-2xl leading-snug max-w-2xl">
          {subtitle}
        </p>
      </header>

      {/* Carousel Container */}
      <div className="relative">
        {/* Desktop Navigation Arrows */}
        {showNavigation && (
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 justify-between w-full z-10 px-2 lg:px-10">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:opacity-80 transition"
              onClick={() => {
                document.getElementById('carousel')?.scrollBy({ left: -320, behavior: 'smooth' })
              }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:opacity-80 transition"
              onClick={() => {
                document.getElementById('carousel')?.scrollBy({ left: 320, behavior: 'smooth' })
              }}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Scrollable Card Row */}
        <div
          id="carousel"
          className="flex gap-3 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
        >
          {validDestinations.map((destination, index) => {
            const heroImageUrl = getImageUrl(destination.heroImage)!
            return (
              <Card
                key={`${destination.slug}-${index}`}
                className="snap-center flex-shrink-0 w-[85%] sm:w-[260px] md:w-[280px] lg:w-[300px] h-[320px] sm:h-[360px] md:h-[400px] overflow-hidden rounded-2xl border-0 bg-transparent relative transition-transform duration-300 hover:scale-[1.02]"
              >
                <CardContent className="p-0 relative h-full">
                  {/* Background Image */}
                  <Image
                    fill
                    src={heroImageUrl}
                    alt={destination.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Badge */}
                  {isClient && (
                    <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#fbae3d] text-white border-0 rounded-md px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
                      {destination.featured ? 'Featured' : '10% Off'}
                    </Badge>
                  )}

                  {/* Heart Icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-transparent"
                  >
                    <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </Button>

                  {/* Text Content */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-5 sm:right-5">
                    <h3 className="[font-family:'Amiri',Helvetica] italic text-white text-2xl sm:text-3xl md:text-4xl leading-tight mb-1 sm:mb-2">
                      {destination.name}
                    </h3>
                    <p className="[font-family:'NATS-Regular',Helvetica] text-white text-xs sm:text-sm leading-snug mb-3 sm:mb-5 line-clamp-2">
                      {destination.shortDescription ||
                        `${destination.country} - Experience the beauty and culture`}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <Image
                          fill
                          src="/vector-1.svg"
                          alt="Vector"
                          className="w-[120px] sm:w-[160px] md:w-[200px] h-px object-cover mb-2"
                        />
                        <div className="text-white text-sm sm:text-base md:text-xl font-normal">
                          {formatPrice(destination.startingPrice)}
                          <span className="text-[10px] sm:text-xs"> (per person)</span>
                        </div>
                      </div>
                      <Link href={`/destinations/${destination.slug}`}>
                        <Button className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#1e1e1e] hover:bg-[#1e1e1e]/80 rounded-full p-0">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                            <Image src="/arrow-1.svg" alt="Arrow" className="w-3 sm:w-4" fill />
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
      </div>
    </section>
  )
}

export default UniformCardCarousel
