// src/blocks/ClientStories/Component.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Review } from '@/payload-types'

// ✅ Slug replacement hook
const useSlugReplacement = () => {
  const pathname = usePathname()

  const slugInfo = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const rawSlug = segments[segments.length - 1] || ''
    const formattedSlug = rawSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    return { raw: rawSlug, formatted: formattedSlug }
  }, [pathname])

  const replaceSlug = (text: string | undefined | null): string => {
    if (!text) return ''
    return text.replace(/{slug}/gi, slugInfo.formatted)
  }

  return { slug: slugInfo.formatted, rawSlug: slugInfo.raw, replaceSlug }
}

// ✅ Enhanced useWindowSize hook with debounce
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined
    height: number | undefined
  }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    height: typeof window !== 'undefined' ? window.innerHeight : undefined,
  }))

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return windowSize
}

type MediaLike = { url?: string | null; alt?: string | null }

type ClientStoriesBlockProps = {
  heading?: string
  subheading?: string
  background?: MediaLike | string | null
  backgroundUrl?: string | null
  overlay?: MediaLike | null
  cardsPerView?: number | null
  gapPx?: number | null
  populateBy?: 'manual' | 'collection' | 'featured'
  limit?: number
  cards?: Array<{
    name?: string | null
    rating?: number | null
    story?: string | null
  }> | null
}

type CardData = {
  name: string
  rating: number
  story: string
  photo?: string | null
}

const extractMediaUrl = (media: any): string | null => {
  if (!media || typeof media === 'string') return null
  if (typeof media === 'object' && typeof media.url === 'string') return media.url
  return null
}

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (img && typeof img === 'object' && 'url' in img && img?.url) return img.url as string
  if (typeof img === 'string') return img
  if (url) return url
  return ''
}

const StarRating: React.FC<{ rating?: number | null }> = ({ rating = 0 }) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${safe} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < safe
        return (
          <svg
            key={i}
            className={`w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ${on ? 'text-yellow-400' : 'text-gray-500'} fill-current`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      })}
    </div>
  )
}

export const ClientStories: React.FC<ClientStoriesBlockProps> = ({
  heading = 'Our client stories from {slug}!',
  subheading = 'Hear what travelers say about {slug}',
  background,
  backgroundUrl,
  overlay,
  cardsPerView: cardsPerViewRaw = 2,
  gapPx: gapPxRaw = 32,
  populateBy = 'manual',
  limit = 10,
  cards: manualCards = [],
}) => {
  // ✅ Slug replacement
  const { replaceSlug, rawSlug } = useSlugReplacement()
  const displayHeading = replaceSlug(heading)
  const displaySubheading = replaceSlug(subheading)

  const { width: windowWidth } = useWindowSize()

  // ✅ Enhanced responsive card calculation with better breakpoints
  const cardsPerView = useMemo(() => {
    if (windowWidth === undefined) return Math.max(1, Number(cardsPerViewRaw) || 2)
    if (windowWidth < 360) return 1 // Extra small mobile
    if (windowWidth < 480) return 1.15 // Small mobile
    if (windowWidth < 640) return 1.3 // Medium mobile
    if (windowWidth < 768) return 1.5 // Large mobile
    if (windowWidth < 1024) return 2 // Tablet
    if (windowWidth < 1280) return 2.5 // Small desktop
    if (windowWidth < 1536) return Math.max(2, Number(cardsPerViewRaw) || 3) // Medium desktop
    return Math.max(2, Number(cardsPerViewRaw) || 3) // Large desktop
  }, [windowWidth, cardsPerViewRaw])

  // We always need an integer slide size for logic
  const slideSize = Math.max(1, Math.floor(cardsPerView))

  // ✅ Responsive gap sizing
  const gapPx = useMemo(() => {
    if (windowWidth === undefined) return Math.max(0, Number(gapPxRaw) || 24)
    if (windowWidth < 480) return 12 // Extra small mobile
    if (windowWidth < 768) return 16 // Mobile
    if (windowWidth < 1024) return 24 // Tablet
    if (windowWidth < 1536) return 28 // Small desktop
    return Math.max(0, Number(gapPxRaw) || 32) // Large desktop
  }, [windowWidth, gapPxRaw])

  // ✅ Fetch reviews from collection if needed
  const [reviewsFromCollection, setReviewsFromCollection] = useState<Review[]>([])
  const [loading, setLoading] = useState(populateBy !== 'manual')

  useEffect(() => {
    if (populateBy === 'manual') return

    const fetchReviews = async () => {
      try {
        let url = `/api/reviews?limit=${limit}&depth=2&sort=-createdAt`

        if (populateBy === 'featured') {
          url += '&where[featured][equals]=true'
        }

        // Auto-filter by current destination/package from URL
        const pathname = window.location.pathname
        if (pathname.includes('/destinations/')) {
          const destSlug = pathname.split('/destinations/')[1]?.split('/')[0]
          if (destSlug) {
            url += `&where[destination.slug][equals]=${destSlug}`
          }
        } else if (pathname.includes('/packages/')) {
          const pkgSlug = pathname.split('/packages/')[1]?.split('/')[0]
          if (pkgSlug) {
            url += `&where[package.slug][equals]=${pkgSlug}`
          }
        }

        const response = await fetch(url)
        const data = await response.json()

        if (data.docs) {
          setReviewsFromCollection(data.docs)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [populateBy, limit, rawSlug])

  // ✅ Transform reviews to card format (with photo)
  const cards: CardData[] = useMemo(() => {
    if (populateBy === 'manual') {
      return (Array.isArray(manualCards) ? manualCards : []).map((c) => ({
        name: c?.name ?? '',
        rating: c?.rating ?? 5,
        story: c?.story ?? '',
        photo: null,
      }))
    }

    return reviewsFromCollection.map((review) => {
      const user =
        review && typeof review.user === 'object' && review.user !== null && 'name' in review.user
          ? (review.user as any)
          : null

      let firstPhoto: string | null = null
      if (Array.isArray(review.photos) && review.photos.length > 0) {
        const first = review.photos[0] as any
        firstPhoto = extractMediaUrl(first?.image)
      }

      return {
        name: review.submitterName || 'Anonymous',
        rating: review.rating || 5,
        story: review.body || '',
        photo: firstPhoto,
      }
    })
  }, [populateBy, manualCards, reviewsFromCollection])

  const totalSlides = useMemo(
    () => Math.max(1, Math.ceil(cards.length / slideSize)),
    [cards.length, slideSize],
  )

  const [currentSlide, setCurrentSlide] = useState(1)

  useEffect(() => {
    setCurrentSlide((s) => Math.min(Math.max(1, s), totalSlides))
  }, [totalSlides])

  const handlePrev = () => setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1))
  const handleNext = () => setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1))

  const cardWidthPct = 100 / cardsPerView
  const translatePct = (currentSlide - 1) * (cardWidthPct * slideSize)

  const bgSrc = getImageSrc(background as any, backgroundUrl as any)
  const overlaySrc =
    getImageSrc(overlay) ||
    'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'

  if (loading) {
    return (
      <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4" />
          <p
            style={{ fontFamily: "'NATS', sans-serif" }}
            className="text-xs xs:text-sm sm:text-base"
          >
            Loading stories...
          </p>
        </div>
      </section>
    )
  }

  if (cards.length === 0) {
    return (
      <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900 flex items-center justify-center">
        <p
          className="text-gray-400 px-4 text-xs xs:text-sm sm:text-base"
          style={{ fontFamily: "'NATS', sans-serif" }}
        >
          No client stories available yet.
        </p>
      </section>
    )
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
      <link href="https://fonts.cdnfonts.com/css/nats" rel="stylesheet" />

      <section className="relative w-full min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900">
        {/* Background */}
        {bgSrc ? (
          <img
            src={bgSrc}
            alt={(background as any)?.alt || 'Background'}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            style={{ zIndex: 0, pointerEvents: 'none' }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900"
            style={{ zIndex: 0 }}
          />
        )}

        {/* Edge-to-edge Overlay visual effect */}
        {overlaySrc && (
          <div
            className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
            style={{ zIndex: 1, height: '40%' }}
          >
            <img
              src={overlaySrc}
              alt={overlay?.alt || 'Decorative Overlay'}
              className="w-full h-full object-cover"
              style={{
                opacity: 0.9,
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-between min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10 xl:p-14 2xl:p-16">
          <div className="flex flex-col lg:flex-row lg:items-start w-full flex-grow relative">
            {/* Left column - Heading */}
            <div className="w-full lg:w-1/3 lg:pr-6 xl:pr-10 2xl:pr-12 space-y-2 xs:space-y-3 sm:space-y-4 text-left mb-6 xs:mb-7 sm:mb-8 lg:mb-0">
              <h1
                className="
                  text-white 
                  flex items-center 
                  font-[700] italic
                  text-[28px] xs:text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] xl:text-[64px] 2xl:text-[80px]
                  leading-[88%] tracking-[-0.011em]
                "
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {displayHeading}
              </h1>

              {displaySubheading && (
                <p
                  className="text-white flex items-center text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl"
                  style={{
                    fontFamily: "'NATS', sans-serif",
                    fontWeight: 400,
                    lineHeight: '1.3',
                    letterSpacing: '-0.011em',
                  }}
                >
                  {displaySubheading}
                </p>
              )}
            </div>

            {/* Right column - Cards carousel */}
            <div className="w-full lg:w-2/3 h-full overflow-hidden px-0">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  gap: `${gapPx}px`,
                  transform: `translateX(-${translatePct}%)`,
                }}
                aria-live="polite"
              >
                {cards.map((card, idx) => {
                  const slideStartIndex = (currentSlide - 1) * slideSize
                  const isLeftmost = idx === slideStartIndex

                  return (
                    <div
                      key={`${card?.name ?? 'card'}-${idx}`}
                      className={`
                        flex-shrink-0 relative 
                        transition-transform duration-500 ease-in-out 
                        ${isLeftmost ? 'scale-[1.01] xs:scale-[1.02] sm:scale-[1.03] lg:scale-105 xl:scale-110 z-10' : 'scale-100'}
                      `}
                      style={{
                        width:
                          windowWidth && windowWidth < 480
                            ? '85vw'
                            : `calc(${cardWidthPct}% - ${gapPx - gapPx / cardsPerView}px)`,
                        minWidth:
                          windowWidth && windowWidth < 360
                            ? '280px'
                            : windowWidth && windowWidth < 480
                              ? '85vw'
                              : 'auto',
                        maxWidth: windowWidth && windowWidth < 480 ? '320px' : 'none',
                      }}
                    >
                      <div
                        className={`
                          w-full
                          h-[320px] xs:h-[320px] sm:h-[340px] md:h-[380px] lg:h-[400px] xl:h-[420px]
                          p-3 xs:p-4 sm:p-5 md:p-6
                          backdrop-blur-md text-left transition-all duration-500
                          ${isLeftmost ? 'bg-white/20 shadow-xl' : 'bg-white/10 shadow-lg'}
                          rounded-xl sm:rounded-2xl
                        `}
                      >
                        <div className="flex flex-col h-full w-full">
                          {/* Image Section (Background) */}
                          {card.photo && (
                            <div className="absolute inset-0 z-0 rounded-xl sm:rounded-2xl overflow-hidden">
                              <img
                                src={card.photo || '/placeholder.png'}
                                alt={card.name || 'Client photo'}
                                className="
                                  w-full 
                                  h-full 
                                  object-cover 
                                  shadow-lg transition-transform duration-300 ease-out
                                  hover:scale-105 hover:-rotate-1 hover:shadow-2xl
                                "
                              />
                            </div>
                          )}

                          {/* Content Section */}
                          <div className="flex flex-col h-full relative z-10 p-0 justify-end">
                            {/* Story Text Section */}
                            <div className="overflow-y-auto overscroll-contain pr-1 sm:pr-2 mb-2 xs:mb-3 sm:mb-4 max-h-[140px] xs:max-h-[150px] sm:max-h-[180px] md:max-h-[200px]">
                              <p
                                className="text-grey-200 leading-relaxed whitespace-pre-line text-[11px] xs:text-xs sm:text-sm md:text-base overflow-hidden"
                                style={{
                                  fontFamily: "'NATS', sans-serif",
                                }}
                              >
                                {card?.story ? `"${card.story}"` : ''}
                              </p>
                            </div>

                            {/* Header Section (Name and Rating) */}
                            <div className="shrink-0">
                              <h3
                                className="font-bold text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg mb-1 xs:mb-1.5 sm:mb-2 text-yellow"
                                style={{
                                  fontFamily: "'NATS', sans-serif",
                                }}
                              >
                                {card?.name ?? ''}
                              </h3>

                              <StarRating rating={card?.rating as number} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="relative mt-4 xs:mt-5 sm:mt-6 lg:mt-8 xl:mt-10">
            <div
              className="absolute top-0 left-0 w-full h-4 xs:h-5 sm:h-6 md:h-8 opacity-40 xs:opacity-50 sm:opacity-60 md:opacity-100"
              style={{
                background:
                  "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='white' stroke-width='4' stroke-dasharray='50 30' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
                maskImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCAyMjRsMTIwLTIxLjNDMjQwIDIwMyA0ODAgMTYwIDcyMCAxNjBzNDgwIDQzIDcyMCA2NC4xTDk2MCAyMjRsLTgwIDQyLjdjLTgwIDQyLjYtMjQwIDEyOC00MDAgMTQ5LjMtMTYwIDIxLjQtMzIwLTIxLjQtNDgwLTMxLjlDMCwyNDUgMCwyMzQgMCwyMjR6Ij48L3BhdGg+PC9zdmc+")',
                maskSize: 'cover',
                maskRepeat: 'no-repeat',
                zIndex: 10,
              }}
            />
            <div className="flex items-center justify-between mt-3 xs:mt-4 sm:mt-5 md:mt-6">
              <div className="hidden sm:flex flex-1" />

              {/* Navigation buttons */}
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
                <button
                  onClick={handlePrev}
                  aria-label="Previous"
                  className="
                    w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12
                    flex items-center justify-center rounded-full 
                    hover:opacity-80 active:scale-95 transition-all
                  "
                  type="button"
                  style={{
                    background: 'rgba(237, 237, 237, 0.75)',
                    opacity: 0.5,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next"
                  className="
                    w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12
                    flex items-center justify-center rounded-full 
                    hover:opacity-80 active:scale-95 transition-all
                  "
                  type="button"
                  style={{
                    background: 'rgba(237, 237, 237, 0.75)',
                    opacity: 0.5,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Slide counter */}
              <div className="flex-1 flex justify-end items-center">
                <div
                  className="text-white flex items-center tracking-wider text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{
                    fontFamily: "'NATS', sans-serif",
                    fontWeight: 400,
                    lineHeight: '1',
                    letterSpacing: '-0.011em',
                  }}
                >
                  {currentSlide}
                  <span className="text-gray-400 mx-1 xs:mx-1.5 sm:mx-2 md:mx-3">/</span>
                  {totalSlides}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ClientStories
