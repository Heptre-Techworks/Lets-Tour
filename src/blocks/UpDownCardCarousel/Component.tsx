// components/blocks/UpDownCardCarousel.tsx
'use client'

import React from 'react'
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
  heroImage?: Media | string
  startingPrice?: number
}

interface UpDownCardCarouselProps {
  title?: string
  subtitle?: string
  destinations?: Destination[]
  layout?: 'masonry' | 'grid'
  showStartingPrice?: boolean
}

export const UpDownCardCarousel: React.FC<UpDownCardCarouselProps> = ({
  title = 'Popular now!',
  subtitle = "Today's enemy is tomorrow's friend.",
  destinations = [],
  layout = 'masonry',
  showStartingPrice = true,
}) => {
  const getImageUrl = (image: Media | string | undefined): string | null => {
    if (!image) return null
    return typeof image === 'string' ? image : image.url
  }

  const formatPrice = (price: number | undefined): string => {
    if (!price) return '117,927'
    return price.toLocaleString('en-IN')
  }

  // Masonry layout positions for different card sizes
  const masonryPositions = [
    // Row 1
    { 
      className: "w-[329px] h-[202px] top-[207px] left-[25px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
    { 
      className: "w-[479px] h-[264px] top-[137px] left-[374px]",
      nameSize: "text-[40px] tracking-[-0.44px] leading-[35.2px] whitespace-nowrap",
      priceSize: "text-base tracking-[-0.18px] leading-[14.1px]",
      largePriceSize: "text-[32px] tracking-[-0.11px] leading-[28.2px]"
    },
    { 
      className: "w-[379px] h-52 top-[193px] left-[873px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
    { 
      className: "w-[329px] h-[181px] top-[220px] left-[1272px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
    // Row 2
    { 
      className: "w-[329px] h-[181px] top-[425px] left-[25px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
    { 
      className: "w-[404px] h-[222px] top-[425px] left-[374px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
    { 
      className: "w-[454px] h-[250px] top-[425px] left-[798px]",
      nameSize: "text-[40px] tracking-[-0.44px] leading-[35.2px] whitespace-nowrap",
      priceSize: "text-base tracking-[-0.18px] leading-[14.1px]",
      largePriceSize: "text-[32px] tracking-[-0.11px] leading-[28.2px]"
    },
    { 
      className: "w-[354px] h-[194px] top-[425px] left-[1272px]",
      nameSize: "text-[32px] tracking-[-0.35px] leading-[28.2px]",
      priceSize: "text-xs tracking-[-0.13px] leading-[10.6px]"
    },
  ]

  const validDestinations = destinations.filter(dest => 
    dest && getImageUrl(dest.heroImage) !== null
  ).slice(0, 8) // Limit to 8 destinations max

  if (validDestinations.length === 0) {
    return (
      <div className="w-full py-8 px-4 text-center text-gray-500">
        No destinations available
      </div>
    )
  }

  return (
    <section className="w-full relative">
      <div className="relative w-full h-[675px]">
        <header className="w-[1195px] h-[47px] mx-auto mb-3">
          <h1 className="w-[1195px] h-[47px] [font-family:'Amiri',Helvetica] font-bold italic text-black text-[64px] tracking-[-0.70px] leading-[56.3px] whitespace-nowrap">
            {title}
          </h1>
          <img
            className="w-[823px] h-px object-cover mt-[27px] ml-[372px]"
            alt="Line"
            src="/line-6.png"
          />
        </header>
        <p className="w-[1195px] mx-auto mb-[130px] [font-family:'NATS-Regular',Helvetica] font-normal text-black text-[26px] tracking-[-0.29px] leading-[22.9px] whitespace-nowrap">
          {subtitle}
        </p>
        
        <div className="relative w-full h-[468px]">
          {validDestinations.map((destination, index) => {
            const heroImageUrl = getImageUrl(destination.heroImage)
            const position = masonryPositions[index] || masonryPositions[0]
            
            return (
              <Card
                key={`destination-${destination.slug}-${index}`}
                className={`absolute ${position.className} rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300`}
              >
                <Link href={`/destinations/${destination.slug}`}>
                  <CardContent className="p-0 relative h-full">
                    <div className="relative h-full">
                      {heroImageUrl && (
                        <img
                          className="absolute inset-0 w-full h-full rounded-xl object-cover"
                          alt={destination.name}
                          src={heroImageUrl}
                        />
                      )}
                      <div className="absolute inset-0 rounded-xl bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_40%,rgba(120,119,120,0)_100%)]" />
                      
                      {/* Destination Name */}
                      <div className={`absolute bottom-12 left-6 [font-family:'Amiri',Helvetica] font-normal italic text-white ${position.nameSize}`}>
                        {destination.name}
                      </div>
                      
                      {/* Price */}
                      <div className={`absolute bottom-12 right-6 [font-family:'NATS-Regular',Helvetica] font-normal text-white text-right ${position.priceSize}`}>
                        {showStartingPrice && (
                          <span className="tracking-[-0.02px]">Starting from </span>
                        )}
                        <span className={position.largePriceSize || "text-2xl tracking-[-0.06px] leading-[21.1px]"}>
                          ₹ {formatPrice(destination.startingPrice)}
                        </span>
                      </div>
                      
                      {/* Decorative Line */}
                      <img
                        className="absolute bottom-6 left-6 right-6 h-px object-cover"
                        alt="Vector"
                        src="/vector-1.svg"
                        style={{ width: 'calc(100% - 48px)' }}
                      />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default UpDownCardCarousel
