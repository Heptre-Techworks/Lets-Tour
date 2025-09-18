// components/DestinationHero.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

type Place = { name: string; slug: string }

type DestinationHeroProps = {
  heroImage: Media | string | null | undefined
  title: string
  places: Place[]
  overlay?: number
  showArrows?: boolean
}

const ChevronLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M15 18L9 12L15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M9 18L15 12L9 6" />
  </svg>
)

export const DestinationHero: React.FC<DestinationHeroProps> = ({
  heroImage,
  title,
  places = [],
  overlay = 0.35,
  showArrows = true,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const delta = dir === 'left' ? -280 : 280
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Guards and normalization for strict-null-safety and valid <Image src>
  const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isValidMedia = (v: unknown): v is Media => {
  if (!v || typeof v !== 'object') return false
  const url = (v as { url?: unknown }).url
  return typeof url === 'string' && url.trim().length > 0
}
  const looksLikeURL = (s: string) => s.startsWith('/') || s.startsWith('http')

  const normalizedResource: Media | string | null =
    isValidMedia(heroImage) ? heroImage :
    (isNonEmptyString(heroImage) && looksLikeURL(heroImage)) ? heroImage :
    null

  const clampedOverlay = Math.max(0, Math.min(1, overlay ?? 0.35))

  return (
    <section
      className="relative -mt-[10.4rem] w-full h-screen overflow-hidden font-roboto text-white"
      data-theme="dark"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {normalizedResource ? (
          <MediaComponent
            fill
            resource={normalizedResource}
            imgClassName="object-cover"
            priority
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${clampedOverlay})` }}
        />
      </div>

      {/* Centered Title */}
      <div className="relative z-10 h-full flex items-center">
        <h1 className="ml-8 sm:ml-12 lg:ml-16 font-playfair italic text-[12vw] leading-none font-bold drop-shadow-xl">
          {title}
        </h1>
      </div>

      {/* Bottom Places Rail */}
      {places.length > 0 && (
        <div className="absolute bottom-6 left-0 w-full z-10">
          <div className="mx-6 md:mx-12 bg-black/35 rounded-full backdrop-blur px-3 py-2 sm:px-4 sm:py-3 flex items-center">
            {showArrows && (
              <button
                aria-label="previous"
                onClick={() => scrollBy('left')}
                className="shrink-0 mr-2 rounded-full bg-white/15 hover:bg-white/25 w-8 h-8 grid place-items-center"
              >
                <ChevronLeftIcon />
              </button>
            )}

            <div ref={scrollerRef} className="flex gap-6 overflow-x-auto scrollbar-none px-2">
              {places.map((p) => (
                <a
                  key={p.slug}
                  href={`/destinations/${p.slug}`}
                  className="text-white/90 hover:text-white whitespace-nowrap"
                >
                  {p.name}
                </a>
              ))}
            </div>

            {showArrows && (
              <button
                aria-label="next"
                onClick={() => scrollBy('right')}
                className="shrink-0 ml-2 rounded-full bg-white/15 hover:bg-white/25 w-8 h-8 grid place-items-center"
              >
                <ChevronRightIcon />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
