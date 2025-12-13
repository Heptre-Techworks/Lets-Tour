'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Amiri } from 'next/font/google'

// Amiri for headings (normal + italic)
const amiri = Amiri({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

type MediaLike = { url?: string | null; alt?: string | null }

type CardData = {
  name?: string
  price?: string
  image?: MediaLike | string | null
  imageUrl?: string | null
  alt?: string | null
  slug?: string
  href?: string
}

type RowData = {
  direction: 'left' | 'right'
  speedSeconds: number
  cards: CardData[]
}

const getImageSrc = (card: CardData) => {
  if (card?.image && typeof card.image === 'object' && 'url' in card.image && card.image?.url) {
    return card.image.url as string
  }
  if (card?.imageUrl) return card.imageUrl
  return ''
}

const DestinationCard: React.FC<{
  name: string
  price: string
  src: string
  alt?: string | null
  href?: string
}> = ({ name, price, src, alt, href }) => {
  const cardContent = (
    <li
      className="
        relative w-72 h-96 flex-shrink-0 snap-center rounded-2xl shadow-lg overflow-hidden group bg-black/5 block hover:shadow-2xl transition-shadow duration-300
      "
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-2">📍</div>
            <div className="text-xs sm:text-sm font-medium">No Image</div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />

      {/* Text overlay: Amiri (title) + NATS (price), keep typographic spec */}
      <div className="absolute bottom-0 left-0 p-4 sm:p-5 md:p-6 text-white">
        <h3
          className="font-bold"
          style={{
            fontFamily: "'Amiri', serif",
            fontStyle: 'italic',
            fontWeight: 700,
            letterSpacing: '-0.011em',
            lineHeight: '88%',
            fontSize: '28px',
          }}
        >
          <span style={{ fontSize: '32px' }}>{name}</span>
        </h3>
        <p
          className="mt-1"
          style={{
            fontFamily: "'NATS', sans-serif",
            fontWeight: 400,
            letterSpacing: '-0.011em',
            lineHeight: '88%',
            fontSize: '12px',
          }}
        >
          <span style={{ fontSize: '16px' }}>
            Starting from <span className="font-semibold">{price}</span>
          </span>
        </p>
      </div>
    </li>
  )

  if (href && href !== '#') {
    return (
      <Link href={href} className="block hover:shadow-2xl transition-shadow duration-300">
        {cardContent}
      </Link>
    )
  }
  return cardContent
}

const InfiniteScroller: React.FC<{
  direction: 'left' | 'right'
  speed: number
  pauseOnHover: boolean
  children: React.ReactNode
  centerOffset: number
  transformOrigin: string
  alignItems: string
}> = ({ direction, speed, pauseOnHover, children, centerOffset, transformOrigin, alignItems }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const scrollerInnerRef = useRef<HTMLUListElement | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const scroller = scrollerRef.current
    const scrollerInner = scrollerInnerRef.current
    if (!scroller || !scrollerInner || scroller.dataset.initialized) return

    const originalChildren = Array.from(scrollerInner.children)
    if (originalChildren.length === 0) return

    originalChildren.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement
      clone.setAttribute('aria-hidden', 'true')
      scrollerInner.appendChild(clone)
    })
    scroller.dataset.initialized = 'true'
  }, [children])

  useEffect(() => {
    const scroller = scrollerRef.current
    const scrollerInner = scrollerInnerRef.current
    if (!scroller || !scrollerInner) return

    const applyScaling = () => {
      if (!scrollerRef.current || !scrollerInnerRef.current) return

      const scrollerWidth = scrollerRef.current.offsetWidth
      const offsetPixels = scrollerWidth * (centerOffset / 100)
      const scrollerCenterX = scrollerWidth / 2 + offsetPixels
      const scrollerRect = scrollerRef.current.getBoundingClientRect()

      const childrenEls = Array.from(scrollerInnerRef.current.children) as HTMLLIElement[]
      const isNarrow = window.matchMedia('(max-width: 640px)').matches
      const minScale = isNarrow ? 0.92 : 0.85

      childrenEls.forEach((child) => {
        const childRect = child.getBoundingClientRect()
        const childCenterX = childRect.left - scrollerRect.left + childRect.width / 2
        const distanceFromCenter = Math.abs(scrollerCenterX - childCenterX)
        const scale = Math.max(minScale, 1 - distanceFromCenter / scrollerWidth)
        ;(child as HTMLElement).style.transformOrigin = transformOrigin
        ;(child as HTMLElement).style.transform = `scale(${scale})`
        ;(child as HTMLElement).style.transition = 'transform 150ms linear'
      })
    }

    const updateLoop = () => {
      applyScaling()
      animationFrameRef.current = requestAnimationFrame(updateLoop)
    }

    animationFrameRef.current = requestAnimationFrame(updateLoop)

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [centerOffset, transformOrigin])

  const directionClass = direction === 'left' ? 'scroll-left' : 'scroll-right'

  return (
    <div ref={scrollerRef} className="scroller overflow-hidden px-3 sm:px-4 md:px-6">
      <ul
        ref={scrollerInnerRef}
        className={`flex w-max ${alignItems} py-2 scroller-inner ${directionClass}`}
        style={{ '--duration': `${speed}s` } as React.CSSProperties}
      >
        {children}
      </ul>
      <style>{`
        @keyframes scroll-left { 
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); } 
        }
        @keyframes scroll-right { 
          from { transform: translateX(-50%); }
          to { transform: translateX(0%); } 
        }
        .scroller-inner.scroll-left { animation: scroll-left var(--duration, 40s) linear infinite; }
        .scroller-inner.scroll-right { animation: scroll-right var(--duration, 40s) linear infinite; }
        .scroller:hover .scroller-inner { 
          animation-play-state: ${pauseOnHover ? 'paused' : 'running'}; 
        }
      `}</style>
    </div>
  )
}

export const PopularNowClient: React.FC<{
  heading?: string
  subheading?: string
  pauseOnHover?: boolean
  rows: RowData[]
}> = ({
  heading = 'Popular now!',
  subheading = "Today's enemy is tomorrow's friend.",
  pauseOnHover = true,
  rows = [],
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mqMobile.matches)
    update()
    mqMobile.addEventListener('change', update)
    return () => mqMobile.removeEventListener('change', update)
  }, [])

  return (
    <section
      className="
        w-full text-[#111827] font-sans flex flex-col
        py-10 sm:py-12 md:py-14 lg:py-16
        min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-screen
      "
    >
      {/* NATS for subheading/prices */}
      <link href="https://fonts.cdnfonts.com/css/nats" rel="stylesheet" />

      {/* Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 md:mb-10">
        <div className="max-w-7xl mx-auto">
          <header>
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <h1
                className={`${amiri.className} italic font-bold flex-shrink-0`}
                style={{
                  fontSize: isMobile ? '36px' : '64px',
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                  color: '#000000',
                }}
              >
                {heading}
              </h1>

              <div
                className="hidden sm:block flex-grow w-full border-t border-dashed"
                style={{ borderColor: '#353535' }}
              />
            </div>

            {subheading ? (
              <p
                className="mt-2"
                style={{
                  fontFamily: "'NATS', sans-serif",
                  fontWeight: 400,
                  fontSize: isMobile ? '18px' : '26px',
                  lineHeight: '88%',
                  letterSpacing: '-0.011em',
                  color: '#000000',
                }}
              >
                {subheading}
              </p>
            ) : null}
          </header>
        </div>
      </div>

      {/* Scrollers (layout/animations unchanged) */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 w-full">
        {Array.isArray(rows) && rows.length > 0 ? (
          rows
            .map((row, idx) => {
              if (!row?.cards || row.cards.length === 0) return null

              const centerOffset = isMobile ? 0 : idx === 0 ? -20 : 20
              const transformOrigin = isMobile ? 'center' : idx === 0 ? 'bottom' : 'top'
              const alignItems = isMobile ? 'items-center' : idx === 0 ? 'items-end' : 'items-start'

              return (
                <InfiniteScroller
                  key={idx}
                  direction={row.direction}
                  speed={row.speedSeconds}
                  pauseOnHover={pauseOnHover}
                  centerOffset={centerOffset}
                  transformOrigin={transformOrigin}
                  alignItems={alignItems}
                >
                  {row.cards.map((card: CardData, i: number) => (
                    <DestinationCard
                      key={`${idx}-${i}`}
                      name={card?.name ?? ''}
                      price={card?.price ?? ''}
                      src={getImageSrc(card)}
                      alt={card?.alt ?? card?.name}
                      href={card?.href}
                    />
                  ))}
                </InfiniteScroller>
              )
            })
            .filter(Boolean)
        ) : (
          <div className="text-center text-gray-500 py-16 sm:py-20 md:py-24">
            No content configured. Please add rows in the admin panel.
          </div>
        )}
      </div>
    </section>
  )
}

export default PopularNowClient
