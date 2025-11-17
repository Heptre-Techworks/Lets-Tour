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

// ✅ useWindowSize hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined
    height: number | undefined
  }>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

type MediaLike = { url?: string | null; alt?: string | null }

type ClientStoriesBlockProps = {
  heading?: string
  subheading?: string
  buttonText?: string
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

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (img && typeof img === 'object' && 'url' in img && img?.url) return img.url as string
  if (typeof img === 'string') return img
  if (url) return url
  return ''
}

const StarRating: React.FC<{ rating?: number | null }> = ({ rating = 0 }) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <div className="flex items-center" aria-label={`Rating ${safe} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < safe
        return (
          <svg
            key={i}
            className={`w-5 h-5 ${on ? 'text-yellow-400' : 'text-gray-500'} fill-current`}
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
  buttonText = 'View all',
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

  const cardsPerView = useMemo(() => {
    if (windowWidth === undefined) return Math.max(1, Number(cardsPerViewRaw) || 2)
    if (windowWidth < 768) return 1.2 // Mobile
    if (windowWidth < 1024) return 2 // Tablet
    return Math.max(1, Number(cardsPerViewRaw) || 3) // Desktop
  }, [windowWidth, cardsPerViewRaw])

  const gapPx = Math.max(0, Number(gapPxRaw) || 24)

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

  // ✅ Transform reviews to card format
  const cards = useMemo(() => {
    if (populateBy === 'manual') {
      return Array.isArray(manualCards) ? manualCards : []
    }

    return reviewsFromCollection.map((review) => {
      const user = typeof review.user === 'object' ? review.user : null
      return {
        name: user?.name || 'Anonymous',
        rating: review.rating || 5,
        story: review.body || '',
      }
    })
  }, [populateBy, manualCards, reviewsFromCollection])

  const totalSlides = useMemo(
    () => Math.max(1, Math.ceil(cards.length / cardsPerView)),
    [cards, cardsPerView],
  )
  const [currentSlide, setCurrentSlide] = useState(1)

  useEffect(() => {
    setCurrentSlide((s) => Math.min(Math.max(1, s), totalSlides))
  }, [totalSlides])

  const handlePrev = () => setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1))
  const handleNext = () => setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1))

  const cardWidthPct = 100 / cardsPerView
  const translatePct = (currentSlide - 1) * (cardWidthPct * cardsPerView)

  const bgSrc = getImageSrc(background as any, backgroundUrl as any)
  const overlaySrc =
    getImageSrc(overlay) ||
    'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'

  if (loading) {
    return (
      <section className="relative w-full min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p style={{ fontFamily: "'NATS', sans-serif" }}>Loading stories...</p>
        </div>
      </section>
    )
  }

  if (cards.length === 0) {
    return (
      <section className="relative w-full min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400" style={{ fontFamily: "'NATS', sans-serif" }}>
          No client stories available yet.
        </p>
      </section>
    )
  }

  return (
    <>
      {/* Load custom fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
      />
      <link href="https://fonts.cdnfonts.com/css/nats" rel="stylesheet" />

      <section className="relative w-full min-h-[70vh] font-sans overflow-hidden text-white bg-gray-900">
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
        <div className="relative z-10 flex flex-col justify-between min-h-[65vh] p-4 md:p-8 lg:p-16">
          <div className="flex flex-col lg:flex-row lg:items-start w-full flex-grow relative">
            {/* Left column */}
            <div className="w-full lg:w-1/3 lg:pr-12 space-y-4 text-left mb-12 lg:mb-0">
              <h1
                className="
    text-white 
    flex items-center 
    font-[700] italic
    text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px]
    leading-[88%] tracking-[-0.011em]
  "
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {displayHeading}
              </h1>

              {displaySubheading ? (
                <p
                  className="text-white flex items-center text-lg sm:text-xl md:text-2xl"
                  style={{
                    fontFamily: "'NATS', sans-serif",
                    fontWeight: 400,
                    lineHeight: '1.2',
                    letterSpacing: '-0.011em',
                  }}
                >
                  {displaySubheading}
                </p>
              ) : null}
              {buttonText ? (
                <button
                  type="button"
                  className={`
    flex items-center justify-center text-center text-white
    rounded-2xl shadow-md hover:opacity-90 transition-opacity duration-300
    w-[140px] h-[40px] text-base
    sm:w-[180px] sm:h-[45px] sm:text-lg
    md:w-[200px] md:h-[50px] md:text-xl
  `}
                  style={{
                    background: '#FBAE3D',
                    fontFamily: "'NATS', sans-serif",
                    fontWeight: 400,
                    letterSpacing: '-0.011em',
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    borderRadius: '16px',
                  }}
                >
                  {buttonText}
                </button>
              ) : null}
            </div>

            {/* Right column */}
            <div className="p-4 pt-10 w-full lg:w-2/3 h-full overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  gap: `${gapPx}px`,
                  transform: `translateX(-${translatePct}%)`,
                }}
                aria-live="polite"
              >
                {cards.map((card, idx) => {
                  const currentCardIndex = Math.round(
                    (translatePct / 100) * (cards.length / cardsPerView),
                  )
                  const isLeftmost = idx === currentCardIndex

                  return (
                    <div
                      key={`${card?.name ?? 'card'}-${idx}`}
                      className={`
    flex-shrink-0 
    transition-transform duration-500 ease-in-out 
    ${isLeftmost ? 'scale-105 sm:scale-110 z-10' : 'scale-100'}
  `}
                      style={{
                        width: `calc(${cardWidthPct}% - ${gapPx - gapPx / cardsPerView}px)`,
                      }}
                    >
                      <div
                        className={`
                          w-full h-[200px] sm:h-[280px] md:h-[320px] p-4 sm:p-5 backdrop-blur-md text-left transition-all duration-500
      ${isLeftmost ? 'bg-white/20 shadow-xl sm:shadow-2xl' : 'bg-white/10 shadow-md sm:shadow-lg'}
      rounded-2xl
    `}
                      >
                        <div className="flex flex-col h-full">
                          {/* Header Section */}
                          <div className="mb-2 md:mb-4 shrink-0">
                            <h3
                              className="font-bold text-base sm:text-lg"
                              style={{
                                fontFamily: "'NATS', sans-serif",
                              }}
                            >
                              {card?.name ?? ''}
                            </h3>

                            <StarRating rating={card?.rating as number} />
                          </div>

                          {/* Story Text Section */}
                          <div className="flex-1 overflow-y-auto overscroll-contain pr-1 sm:pr-2">
                            <p
                              className="text-gray-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm md:text-base"
                              style={{
                                fontFamily: "'NATS', sans-serif",
                              }}
                            >
                              {card?.story ? `"${card.story}"` : ''}
                            </p>
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
          <div className="relative mt-auto pt-10">
            <div
              className="absolute top-0 left-0 w-full h-8"
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
            <div className="flex items-center justify-between mt-6">
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  aria-label="Previous"
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                  type="button"
                  style={{
                    background: 'rgba(237, 237, 237, 0.75)',
                    opacity: 0.5,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                  type="button"
                  style={{
                    background: 'rgba(237, 237, 237, 0.75)',
                    opacity: 0.5,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
              <div className="flex-1 flex justify-end items-center">
                <div
                  className="text-white flex items-center tracking-wider text-4xl sm:text-5xl"
                  style={{
                    fontFamily: "'NATS', sans-serif",
                    fontWeight: 400,
                    lineHeight: '1',
                    letterSpacing: '-0.011em',
                  }}
                >
                  {currentSlide}
                  <span className="text-gray-400 mx-2 sm:mx-3">/</span>
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
