'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

type MediaDoc = { id: string; url: string; alt?: string } | null | undefined

type CardItem = {
  id?: string | number
  title: string
  price?: number
  image?: string | MediaDoc
  link?: string
  size?: 'large' | 'medium' | 'small'
}

type Props = {
  title?: string
  subtitle?: string
  cards?: CardItem[]
}

const resolveMediaUrl = (img?: string | MediaDoc): string | null => {
  if (!img) return null
  if (typeof img === 'string') {
    const t = img.trim()
    return t ? t : null
  }
  const t = img?.url?.trim()
  return t ? t : null
}

const resolveMediaAlt = (img: string | MediaDoc | undefined, fallback: string): string => {
  if (!img) return fallback
  if (typeof img === 'string') return fallback
  return img?.alt?.trim() || fallback
}

const sizeToWidthClasses = (size?: CardItem['size']) => {
  switch (size) {
    case 'large':
      return 'w-[190px] h-[130px]'
    case 'small':
      return 'w-[135px] h-[92px]'
    case 'medium':
    default:
      return 'w-[160px] h-[110px]'
  }
}

export const PopularNowBlock: React.FC<Props> = ({
  title = 'Popular now!',
  subtitle = "Today's enemy is tomorrow's friend.",
  cards = [],
}) => {
  const topRowRef = useRef<HTMLDivElement>(null)
  const bottomRowRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const animationIdRef = useRef<number>(0)

  const items = useMemo(() => cards ?? [], [cards])
  
  // Split cards into two rows
  const topRowCards = items.filter((_, index) => index % 2 === 0)
  const bottomRowCards = items.filter((_, index) => index % 2 === 1)

  // Smooth auto-scroll effect - BOTH ROWS RIGHT TO LEFT
  useEffect(() => {
    if (isPaused) return

    const scrollStep = 0.8 // pixels per frame - adjust for speed

    const step = () => {
      // Top row scrolling right to left
      if (topRowRef.current) {
        const row = topRowRef.current
        const maxScroll = row.scrollWidth - row.clientWidth
        
        if (row.scrollLeft <= 1) {
          // Smooth reset to end for infinite loop
          row.scrollLeft = maxScroll
        } else {
          row.scrollLeft = Math.max(0, row.scrollLeft - scrollStep)
        }
      }

      // Bottom row scrolling right to left (same direction as top)
      if (bottomRowRef.current) {
        const row = bottomRowRef.current
        const maxScroll = row.scrollWidth - row.clientWidth
        
        if (row.scrollLeft <= 1) {
          // Smooth reset to end for infinite loop
          row.scrollLeft = maxScroll
        } else {
          row.scrollLeft = Math.max(0, row.scrollLeft - scrollStep)
        }
      }

      animationIdRef.current = requestAnimationFrame(step)
    }

    animationIdRef.current = requestAnimationFrame(step)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isPaused])

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <header className="mb-6 md:mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-gray-600 italic">"{subtitle}"</p>}
        </header>

        <div 
          className="space-y-6"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top Row */}
          <div
            ref={topRowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Triple duplication for smooth infinite scroll */}
            {[...topRowCards, ...topRowCards, ...topRowCards, ...topRowCards].map((item, idx) => {
              const copyIndex = Math.floor(idx / topRowCards.length)
              const uniqueKey = `top-${item.id ?? (idx % topRowCards.length)}-${copyIndex}`
              return <Card key={uniqueKey} item={item} />
            })}
          </div>

          {/* Bottom Row */}
          <div
            ref={bottomRowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Triple duplication for smooth infinite scroll */}
            {[...bottomRowCards, ...bottomRowCards, ...bottomRowCards, ...bottomRowCards].map((item, idx) => {
              const copyIndex = Math.floor(idx / bottomRowCards.length)
              const uniqueKey = `bottom-${item.id ?? (idx % bottomRowCards.length)}-${copyIndex}`
              return <Card key={uniqueKey} item={item} />
            })}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

const Card: React.FC<{ item: CardItem }> = ({ item }) => {
  const url = resolveMediaUrl(item.image)
  const alt = resolveMediaAlt(item.image, item.title)
  const sizeClass = sizeToWidthClasses(item.size)

  const body = (
    <div className={`${sizeClass} relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-shadow flex-shrink-0`}>
      {url ? (
        <img
          src={url}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div aria-label={`${alt} image placeholder`} className="absolute inset-0 bg-gray-200" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
        <div className="text-white">
          <h3 className="text-lg font-serif drop-shadow-sm">{item.title}</h3>
        </div>
        {typeof item.price === 'number' && (
          <div className="text-right text-white">
            <p className="text-xs opacity-90">Starting from</p>
            <p className="text-sm font-semibold">₹{item.price.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )

  return item.link ? (
    <Link href={item.link} className="group">
      {body}
    </Link>
  ) : body
}

export default PopularNowBlock
