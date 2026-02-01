// src/blocks/DestinationHeroCarousel/Component.client.tsx
'use client'

import React, { useRef, useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import RichText from '@/components/RichText'

const ChevronLeftIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ChevronRightIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={className} {...props}>
    {children}
  </button>
)

function PlaneIcon({
  className = 'w-6 h-6',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      style={style}
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V20l-2 1.5V23l3-1 3 1v-1.5L13 20v-6.5l8 2.5Z" />
    </svg>
  )
}

interface Media {
  url: string
  alt?: string
}

interface Stop {
  id?: string
  name: string
  city: string
  image: Media | string
  excerpt: any
  slug?: string
}

interface TimingSettings {
  autoplayDelay?: number
  transitionDuration?: number
}

interface DestinationHeroCarouselClientProps {
  title?: string
  stops: Stop[]
  timingSettings?: TimingSettings
}

export const DestinationHeroCarouselClient: React.FC<DestinationHeroCarouselClientProps> = ({
  title = 'Things to do in {slug}',
  stops = [],
  timingSettings = {},
}) => {
  const pathname = usePathname()

  const displayTitle = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const rawSlug = segments[segments.length - 1] || ''
    const formattedSlug = rawSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    return title.replace(/{slug}/gi, formattedSlug)
  }, [pathname, title])

  const AUTOPLAY_DELAY = timingSettings?.autoplayDelay || 5000
  const TRANSITION_DURATION_MS = timingSettings?.transitionDuration || 500

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const getImageUrl = (image: Media | string | undefined): string => {
    if (!image) return 'https://placehold.co/480x460/FDBA74/FFFFFF?text=Explore!'
    return typeof image === 'string' ? image : image.url
  }

  const processedStops = useMemo(
    () => stops.map((stop, index) => ({ ...stop, id: stop.slug || stop.id || `stop-${index}` })),
    [stops],
  )

  const [currentIndex, setCurrentIndex] = useState(2)
  const [transitionStyle, setTransitionStyle] = useState(
    `transform ${TRANSITION_DURATION_MS}ms ease-out`,
  )
  const [planeTransitionStyle, setPlaneTransitionStyle] = useState(
    `offset-distance ${TRANSITION_DURATION_MS}ms ease-out, opacity ${TRANSITION_DURATION_MS}ms ease-out`,
  )

  const infiniteStops = useMemo(() => {
    if (processedStops.length < 3) return processedStops
    const clonesStart = processedStops.slice(processedStops.length - 2)
    const clonesEnd = processedStops.slice(0, 2)
    return [...clonesStart, ...processedStops, ...clonesEnd]
  }, [processedStops])

  const handleTransitionEnd = () => {
    if (currentIndex === processedStops.length + 2) {
      setTransitionStyle('none')
      setPlaneTransitionStyle('none')
      setCurrentIndex(2)
    }
    if (currentIndex === 1) {
      setTransitionStyle('none')
      setPlaneTransitionStyle('none')
      setCurrentIndex(processedStops.length + 1)
    }
  }

  useEffect(() => {
    if (transitionStyle === 'none') {
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          setTransitionStyle(`transform ${TRANSITION_DURATION_MS}ms ease-out`)
          setPlaneTransitionStyle(
            `offset-distance ${TRANSITION_DURATION_MS}ms ease-out, opacity ${TRANSITION_DURATION_MS}ms ease-out`,
          )
        })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [transitionStyle, TRANSITION_DURATION_MS])

  const scrollLeft = () => setCurrentIndex((prev) => prev - 1)
  const scrollRight = () => setCurrentIndex((prev) => prev + 1)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!isPaused && infiniteStops.length > 3) {
      timeoutRef.current = setTimeout(() => {
        scrollLeft()
      }, AUTOPLAY_DELAY)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentIndex, isPaused, infiniteStops.length, AUTOPLAY_DELAY])

  const centerCardWidth = 450
  const gap = 0

  const transformValue = useMemo(() => {
    if (viewportWidth === 0) return 0
    const itemContainerWidth = centerCardWidth + gap
    const totalPrecedingWidth = currentIndex * itemContainerWidth
    const centerScreenOffset = viewportWidth / 2 - itemContainerWidth / 2
    return totalPrecedingWidth - centerScreenOffset
  }, [currentIndex, viewportWidth, centerCardWidth, gap])

  const arcPath = 'M20 360 C 600 20, 1400 20, 1980 360'

  if (processedStops.length === 0) {
    return (
      <div className="w-full py-8 px-4 text-center text-gray-500">No destinations available</div>
    )
  }

  return (
    <section
      className="relative w-full bg-white font-sans overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <svg className="w-0 h-0 absolute">
        <defs>
          <clipPath id="card-shape" clipPathUnits="userSpaceOnUse">
            <path d="M225,0 L195,30 L8,30 A8,8 0 0 0 0,38 L0,300 L450,300 L450,38 A8,8 0 0 0 442,30 L255,30 Z" />
          </clipPath>
        </defs>
      </svg>
      <h1 className="text-3xl md:text-4xl font-bold text-center mt-8 mb-6 text-gray-800">
        {displayTitle}
      </h1>

      <div className="relative w-full" style={{ height: '100px' }}>
        <svg
          className="absolute inset-x-0 -top-4 h-[340px] w-[2000px] max-w-none left-1/2 -translate-x-1/2 pointer-events-none"
          viewBox="0 0 2000 340"
          fill="none"
        >
          <path
            id="flight-arc"
            d={arcPath}
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeDasharray="6 8"
            fill="none"
          />
        </svg>

        <svg
          className="absolute inset-x-0 -top-4 h-[340px] w-[2000px] max-w-none left-1/2 -translate-x-1/2"
          viewBox="0 0 2000 340"
        >
          {infiniteStops.map((stop, idx) => {
            const centerPlaneDataIndex = currentIndex
            const positionDelta = idx - centerPlaneDataIndex
            const distance = Math.abs(positionDelta)

            if (distance > 3) return null

            const spacing = 0.12
            const centerPosition = 0.5
            const positionMultiplier = distance >= 3 ? 1.5 : 1
            const targetPosition = centerPosition + positionDelta * spacing * positionMultiplier
            const opacity = distance >= 3 ? 0 : distance === 2 ? 0.5 : 1
            const isCenter = positionDelta === 0
            const isOuter = distance === 2

            return (
              <g key={`${stop.id}-${idx}`}>
                <foreignObject
                  x="-13"
                  y="14"
                  width="100%"
                  height="100%"
                  style={{ overflow: 'visible' }}
                >
                  <div
                    style={{
                      offsetPath: `path('${arcPath}')`,
                      offsetRotate: 'auto 90deg',
                      offsetDistance: `${targetPosition * 100}%`,
                      transition: planeTransitionStyle,
                      position: 'absolute',
                      opacity: opacity,
                    }}
                  >
                    <PlaneIcon
                      className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-500 ${isCenter ? 'text-black scale-110' : 'text-gray-800 scale-100'} ${isOuter ? 'scale-90' : ''}`}
                      style={{ transform: 'translateX(-50%) translateY(-80%)' }}
                    />
                  </div>
                </foreignObject>
                <foreignObject
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  style={{ overflow: 'visible' }}
                >
                  <div
                    style={{
                      offsetPath: `path('${arcPath}')`,
                      offsetRotate: '0deg',
                      offsetDistance: `${targetPosition * 100}%`,
                      transition: planeTransitionStyle,
                      position: 'absolute',
                      opacity: opacity,
                    }}
                  >
                    <div
                      className={`flex flex-col items-center text-center transition-all duration-500 ${isCenter ? 'scale-105' : 'scale-90'} ${isOuter ? 'scale-90' : ''}`}
                      style={{ transform: 'translateY(40px)' }}
                    >
                      {/* Chip under plane: removed border and city line */}
                      <div className="px-3 py-1.5 rounded-full bg-white">
                        <span className="font-semibold text-sm block">{stop.name}</span>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="relative pb-12 w-full">
        <Button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[50px] h-[50px] bg-gray-200/75 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-all z-50 flex items-center justify-center"
          aria-label="Previous destinations"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-[50px] h-[50px] bg-gray-200/75 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-all z-50 flex items-center justify-center"
          aria-label="Next destinations"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>

        <div className="overflow-hidden w-full">
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              width: 'max-content',
              transform: `translateX(-${transformValue}px)`,
              transition: transitionStyle,
            }}
            className="flex items-end gap-0 pt-16 pb-12"
          >
            {infiniteStops.map((stop, idx) => {
              const isCenter = idx === currentIndex

              return (
                <div
                  key={`${stop.id}-${idx}`}
                  className="flex justify-center items-end"
                  style={{ width: `${centerCardWidth}px` }}
                >
                  <div
                    className={`relative shrink-0 transition-all ease-out ${isCenter ? `w-[450px] h-[480px] translate-y-8` : `w-[280px] h-[340px]`}`}
                    style={{ transitionDuration: `${TRANSITION_DURATION_MS}ms` }}
                  >
                    <article
                      className={`group rounded-lg overflow-hidden h-full flex flex-col shadow-lg ${isCenter ? 'bg-transparent' : 'bg-white'}`}
                    >
                      {isCenter ? (
                        <>
                          <div
                            className="w-full overflow-hidden"
                            style={{ height: '300px', clipPath: 'url(#card-shape)' }}
                          >
                            <Image
                              src={getImageUrl(stop.image)}
                              alt={`${stop.name}, ${stop.city}`}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out" // Added transition
                              draggable={false}
                              fill
                              sizes="(max-width: 768px) 100vw, 500px"
                              priority={true} // Priority for center
                            />
                          </div>
                          <div className="bg-orange-400 text-white px-4 h-[180px] flex flex-col justify-center text-center rounded-b-lg transition-colors duration-500">
                            <h3 className="font-serif italic text-xl md:text-2xl">{stop.name}</h3>
                            <div className="text-sm mt-1">
                               <RichText data={stop.excerpt} enableGutter={false} enableProse={false} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="relative w-full h-full transition-opacity duration-500">
                          <Image
                            src={getImageUrl(stop.image)}
                            alt={`${stop.name}, ${stop.city}`}
                            className="h-full w-full object-cover rounded-lg brightness-75 hover:brightness-100 transition-all duration-500"
                            draggable={false}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            loading="eager" // Preload adjacent images
                          />
                          <div className="absolute bottom-0 left-0 w-full bg-orange-400/90 h-20 flex items-center justify-center text-center rounded-b-lg">
                            <h3 className="font-serif italic text-white text-lg">{`${stop.name}, ${stop.city}`}</h3>
                          </div>
                        </div>
                      )}
                    </article>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
