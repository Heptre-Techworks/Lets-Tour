'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RichText from '@/components/RichText'

// Narrow media shape from Payload Upload relation
type MediaLike =
  | {
      url?: string | null
      alt?: string | null
      sizes?: Record<string, { url?: string | null } | undefined> | null
    }
  | null
  | undefined

// Local card helper type
type CardLike = {
  name?: string | null
  details?: any
  discount?: string | null
  price?: number | string | null
  image?: MediaLike | string | null
  imageUrl?: string | null
  alt?: string | null
  href?: string | null
}

const isMediaLike = (v: unknown): v is Exclude<MediaLike, string> =>
  !!v &&
  typeof v === 'object' &&
  ('url' in (v as Record<string, unknown>) || 'alt' in (v as Record<string, unknown>))

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (typeof img === 'string' && img) return img
  if (isMediaLike(img)) {
    if (img?.url) return img.url
    const sizes = img?.sizes || null
    if (sizes) {
      for (const key of Object.keys(sizes)) {
        const s = sizes[key]
        if (s?.url) return s.url
      }
    }
  }
  if (url) return url
  return ''
}

const HeartIcon: React.FC<{ isFavorite: boolean; onClick: (e: React.MouseEvent) => void }> = ({
  isFavorite,
  onClick,
}) => (
  <svg
    onClick={onClick}
    className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 cursor-pointer transition-all duration-300 ease-in-out ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-label="Favorite"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
)

const ArrowRightIcon = () => (
  <svg
    className="w-4 h-4 sm:w-5 sm:h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

const DashedRule: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`h-px w-full ${className}`}
    style={{ borderTop: '1px dashed #353535' }}
    aria-hidden
  />
)

const CarouselCard: React.FC<{ 
    card: CardLike; 
    isEven: boolean; 
    activeFont?: string; 
    fontStyle?: string;
    isCustom?: boolean;
}> = ({ card, isEven, activeFont, fontStyle, isCustom }) => {
  const [isFavorite, setIsFavorite] = React.useState(false)

  const priceNum =
    typeof card?.price === 'string'
      ? Number(card.price)
      : typeof card?.price === 'number'
        ? card.price
        : 0
  const safePrice = Number.isFinite(priceNum) ? priceNum : 0
  const formattedPrice = new Intl.NumberFormat('en-IN').format(safePrice)

  const imgSrc = getImageSrc(card?.image, card?.imageUrl)
  const alt =
    (card?.alt && String(card.alt)) ||
    (isMediaLike(card?.image) && card?.image?.alt) ||
    card?.name ||
    'Image'

  const href = card?.href || '#'

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite((v) => !v)
  }

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Link
      href={href}
      className={`block relative flex-shrink-0 group
        ${isEven ? 'translate-y-0' : 'translate-y-10 sm:translate-y-12 md:translate-y-14 lg:translate-y-16'}
      `}
      style={{
        width: '320px',
        height: '420px',
      }}
    >
      <div
        className="relative w-full h-full rounded-xl transform transition-all duration-300 group-hover:scale-105"
        style={{
          borderRadius: '12px',
        }}
      >
        {imgSrc ? (
          <Image
            fill
            src={imgSrc}
            alt={alt ?? 'Image'}
            className="w-full h-full object-cover rounded-xl"
            style={{
              borderRadius: '12px',
              filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
            }}
          />
        ) : (
          <div
            className="w-full h-full bg-gray-300"
            style={{ borderRadius: '12px' }}
            aria-hidden="true"
          />
        )}

        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              'linear-gradient(0deg, rgba(0, 0, 0, 0.75) 25.8%, rgba(120, 119, 120, 0) 65.07%)',
            borderRadius: '12px',
          }}
        />

        <div className="absolute inset-0 p-5 sm:p-6 lg:p-7 flex flex-col text-white">
          <div className="flex justify-between items-start">
            {card?.discount ? (
              <span
                className="text-white font-bold px-4 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center text-center text-sm sm:text-base lg:text-base"
                style={{
                  background: '#FBAE3D',
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                  fontFamily: activeFont,
                  borderRadius: '8px',
                }}
              >
                {card.discount}
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={handleHeartClick}
              className="z-10 relative"
              aria-label="Add to favorites"
              type="button"
            >
              <HeartIcon isFavorite={isFavorite} onClick={handleHeartClick} />
            </button>
          </div>

          <div className="mt-auto">
            <h3
              className="font-bold group-hover:text-yellow-300 transition-colors flex items-center text-3xl sm:text-4xl md:text-[44px] lg:text-5xl"
              style={{
                fontFamily: activeFont,
                fontStyle: isCustom ? 'normal' : 'italic',
                lineHeight: '88%',
                letterSpacing: '-0.011em',
              }}
            >
              {card?.name ?? ''}
            </h3>
            {card?.details ? (
              <div
                className="flex items-center mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg"
                style={{
                  fontFamily: activeFont,
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                }}
              >
                <RichText data={card.details} enableGutter={false} enableProse={false} />
              </div>
            ) : null}

            <div className="flex justify-between items-center mt-2.5">
              <div className="flex items-center flex-wrap">
                <span
                  className="font-bold text-2xl sm:text-3xl lg:text-4xl"
                  style={{
                    fontFamily: activeFont,
                    lineHeight: '88%',
                    letterSpacing: '-0.011em',
                  }}
                >
                  ₹ {formattedPrice}
                </span>
                <span
                  className="ml-2 text-xs sm:text-sm lg:text-base"
                  style={{
                    fontFamily: activeFont,
                    opacity: 0.8,
                  }}
                >
                  {/* (per person) */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span
        onClick={handleArrowClick}
        className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg z-10"
        style={{
          width: '50px',
          height: '50px',
          background: '#1E1E1E',
        }}
        aria-label={`View details for ${card?.name}`}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: '38px',
            height: '38px',
            background: '#FFFFFF',
          }}
        >
          <span style={{ color: '#1E1E1E' }}>
            <ArrowRightIcon />
          </span>
        </div>
      </span>
    </Link>
  )
}

export const UpDownCardCarouselClient: React.FC<{
  heading?: string
  subheading?: string
  cards?: CardLike[]
  headerTypography?: any
  cardTypography?: any
}> = ({
  heading = 'In Season',
  subheading = "Today's enemy is tomorrow's friend.*",
  cards = [],
  headerTypography,
  cardTypography
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Typography Helper
  const getTypographyStyles = (typography: any, defaultFamily: string = "'Amiri', serif") => {
    const fontMap: Record<string, string> = {
        inter: "'Inter', sans-serif",
        merriweather: "'Merriweather', serif",
        roboto: "'Roboto', sans-serif",
        poppins: "'Poppins', sans-serif",
    }
    const activeFont = typography?.fontFamily ? fontMap[typography.fontFamily] : defaultFamily
    const fontStyle = typography?.fontFamily ? 'normal' : 'italic'
    const isCustom = !!typography?.fontFamily

    const size = typography?.fontSize || 'base'
    const sizeMap: Record<string, { heading: string, subheading: string }> = {
        sm: { heading: 'text-3xl md:text-5xl', subheading: 'text-lg md:text-xl' },
        base: { heading: 'text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px]', subheading: 'text-xl sm:text-xl md:text-xl lg:text-2xl' },
        lg: { heading: 'text-5xl sm:text-6xl md:text-[80px]', subheading: 'text-2xl md:text-[32px]' },
        xl: { heading: 'text-6xl sm:text-7xl md:text-[96px]', subheading: 'text-3xl md:text-[40px]' },
        '2xl': { heading: 'text-7xl sm:text-8xl md:text-[112px]', subheading: 'text-4xl md:text-[48px]' },
    }
    const sizes = sizeMap[size] || sizeMap.base

    return { activeFont, fontStyle, isCustom, sizes }
  }

  // Header Styles
  const headerTypo = getTypographyStyles(headerTypography, "'Amiri', serif")
  // Card Styles
  const cardTypo = getTypographyStyles(cardTypography, "'Inter', sans-serif")


  // ✅ Custom 0.2-second smooth scroll
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const amount = direction === 'left' ? -370 : 370
    const duration = 200 // 0.2 seconds
    const start = container.scrollLeft
    const end = start + amount
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      container.scrollLeft = start + (end - start) * progress
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;700&family=Poppins:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <section
        className="w-screen relative pb-12 sm:pb-16 md:pb-20"
        style={{
          maxWidth: '100vw',
          overflow: 'hidden',
          fontFamily: headerTypo.activeFont // Apply globally to section
        }}
      >
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20" style={{ marginBottom: '-20px' }}>
          <div className="pt-8 sm:pt-10 lg:pt-12">
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              <h1
                className={`font-bold text-black whitespace-nowrap ${headerTypo.sizes.heading}`}
                style={{
                  fontFamily: headerTypo.activeFont, // Use selected font
                  fontStyle: headerTypo.fontStyle,
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                }}
              >
                {heading}
              </h1>
              <div className="flex-1 hidden sm:block">
                <DashedRule />
              </div>
            </div>
            {subheading ? (
              <p
                className={`text-black mt-4 sm:mt-5 flex items-center ${headerTypo.sizes.subheading}`}
                style={{
                  fontFamily: headerTypo.activeFont, // Use selected font
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                }}
              >
                {subheading}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="relative flex items-center"
          style={{
            height: '500px',
            width: '100vw',
            overflow: 'visible',
          }}
        >
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 top-1/2 -translate-y-1/2 z-20 rounded-full hover:bg-gray-300 transition-all hidden md:flex items-center justify-center"
            type="button"
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(237, 237, 237, 0.75)',
              opacity: 0.5,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            }}
          >
            <ChevronLeftIcon />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center overflow-auto scrollbar-hide"
            style={{
              gap: '28px',
              height: '600px',
              paddingLeft: '24px',
              paddingRight: '24px',
              width: '100%',
              WebkitOverflowScrolling: 'touch',

              // ✅ Enable horizontal only, prevent vertical trap
              overflowX: 'auto',
              overflowY: 'hidden',
              touchAction: 'pan-x pan-y',
            }}
          >
            {Array.isArray(cards) &&
              cards.map((card, index) => (
                <CarouselCard
                  key={`${card?.name ?? 'card'}-${index}`}
                  card={card}
                  isEven={index % 2 === 0}
                  activeFont={cardTypo.activeFont}
                  fontStyle={cardTypo.fontStyle}
                  isCustom={cardTypo.isCustom}
                />
              ))}
          </div>

          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 top-1/2 -translate-y-1/2 z-20 rounded-full hover:bg-gray-300 transition-all hidden md:flex items-center justify-center"
            type="button"
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(237, 237, 237, 0.75)',
              opacity: 0.5,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            }}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}

export default UpDownCardCarouselClient
