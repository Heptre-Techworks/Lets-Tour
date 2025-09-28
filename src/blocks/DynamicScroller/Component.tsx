// src/blocks/DynamicScroller/Component.tsx
'use client'

import React from 'react'
import type { DynamicScrollerBlock as DynamicScrollerBlockGen } from '@/payload-types'

// Media shape (robust to partial population)
type MediaSize = { url?: string | null; width?: number; height?: number }
type Media = {
  id: string
  url?: string | null
  filename?: string | null
  alt?: string | null
  sizes?: Record<string, MediaSize | undefined> | null
} | string | null | undefined

// Narrow useful shapes from generated types
type Section = NonNullable<DynamicScrollerBlockGen['sections']>[number]
type Item = NonNullable<Section['items']>[number]
type ItineraryActivity = {
  icon?: Media
  description: string
  detailsImage?: Media
}

// Resolve a usable image URL from a Payload upload relation
function resolveMediaUrl(
  media: Media,
  opts?: { size?: string; baseURL?: string; uploadsBase?: string }
): string | undefined {
  const baseURL = opts?.baseURL ?? process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const uploadsBase = opts?.uploadsBase ?? process.env.NEXT_PUBLIC_UPLOADS_URL ?? '/media'

  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as Exclude<Media, string | null | undefined> & { id: string }
    const sizeKey = opts?.size
    const sized = sizeKey && m.sizes?.[sizeKey]
    if (sized && sized.url) return sized.url
    if (m.url) return m.url
    if (m.filename) return `${baseURL}${uploadsBase}/${m.filename}`
    return undefined
  }

  if (typeof media === 'string') {
    if (/^https?:\/\//i.test(media)) return media
    return undefined
  }

  return undefined
}

// Resolve an alt text from Media or fallback to a provided label
function resolveMediaAlt(media: Media, fallback: string): string {
  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as Exclude<Media, string | null | undefined> & { id: string }
    return (m.alt ?? '').trim() || fallback
  }
  return fallback
}

// Type guards
const isPackageItem = (item: Item): item is Item & { blockType: 'packageItem' } =>
  item?.blockType === 'packageItem'
const isItineraryDay = (item: Item): item is Item & { blockType: 'itineraryDay' } =>
  item?.blockType === 'itineraryDay'

// Constant icons (no external src)
const ChevronLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Cards
const PackageCard: React.FC<{ item: Extract<Item, { blockType: 'packageItem' }> }> = ({ item }) => {
  const image = (item as any).image as Media
  const title = ((item as any).title as string) || ''
  const src = resolveMediaUrl(image, { size: process.env.NEXT_PUBLIC_IMAGE_SIZE })
  const alt = resolveMediaAlt(image, title)

  // EXPLICIT return to avoid 'void' inference
  return (
    <div className="relative w-72 h-96 flex-shrink-0 snap-center rounded-2xl shadow-lg overflow-hidden group">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-200" aria-hidden />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      {((item as any).tag || (item as any).tagColor) && (
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              ((item as any).tagColor as string) || 'bg-white/80 text-gray-800'
            }`}
          >
            {(item as any).tag as string}
          </span>
        </div>
      )}
      <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 p-5 text-white">
        <h3 className="text-3xl font-bold font-serif">{title}</h3>
        <p className="text-sm mt-1">
          Packages starting at <br />
          <span className="font-bold text-lg">₹ {(item as any).price as string}</span> /person
        </p>
      </div>
    </div>
  )
}

const ItineraryCard: React.FC<{ item: Extract<Item, { blockType: 'itineraryDay' }> }> = ({ item }) => {
  const activities = ((item as any).activities || []) as ItineraryActivity[]
  return (
    <div className="w-96 flex-shrink-0 snap-start bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-6">{(item as any).day as string}</h3>
      <div className="space-y-4">
        {activities.map((activity: ItineraryActivity, idx: number) => {
          const iconSrc = activity.icon ? resolveMediaUrl(activity.icon, { size: 'thumbnail' }) : undefined
          const detailsSrc = activity.detailsImage ? resolveMediaUrl(activity.detailsImage, { size: process.env.NEXT_PUBLIC_IMAGE_SIZE }) : undefined

          return (
            <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
              <div className="flex-shrink-0 bg-gray-100 p-2 rounded-full">
                {iconSrc ? <img src={iconSrc} alt="" className="w-6 h-6" /> : <div className="w-6 h-6" />}
              </div>
              <div className="flex-grow">
                <p className="text-gray-700">{activity.description}</p>
                {detailsSrc && (
                  <div className="mt-2 flex items-center">
                    <img src={detailsSrc} alt="Details" className="w-24 h-14 object-cover rounded-lg mr-4" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Section
const DynamicSection: React.FC<{ section: Section }> = ({ section }) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.offsetWidth * 0.8
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Keep position selection; fixed button style and local icons
  const navPositionClasses: Record<string, string> = {
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  }

  const buttonClass =
    'w-12 h-12 rounded-full flex items-center justify-center bg-white text-gray-900 shadow-md transition-transform hover:scale-110'

  const items = (section.items || []) as Item[]

  return (
    <section className={`relative py-12 ${section?.theme?.background || 'bg-white'} font-sans`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(section.title || section.subtitle) && (
          <div className="relative mb-8 pl-8">
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-12 w-2 ${section?.theme?.headerAccent || 'bg-gray-900'} rounded-full`} />
            {section.title && <h2 className={`text-4xl font-bold ${section?.theme?.titleColor || 'text-gray-900'}`}>{section.title}</h2>}
            {section.subtitle && <p className={`mt-1 ${section?.theme?.subtitleColor || 'text-gray-500'}`}>{section.subtitle}</p>}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' } as any}
        >
          {section.type === 'package' && items.filter(isPackageItem).map((item, idx) => <PackageCard key={(item as any).id || idx} item={item} />)}
          {section.type === 'itinerary' && items.filter(isItineraryDay).map((item, idx) => <ItineraryCard key={(item as any).day || idx} item={item} />)}
        </div>

        {section.navigation && (
          <div className={`absolute flex space-x-2 ${navPositionClasses[section.navigation.position || 'bottom-left']}`}>
            <button
              onClick={() => scroll('left')}
              className={buttonClass}
              aria-label="Previous"
              type="button"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll('right')}
              className={buttonClass}
              aria-label="Next"
              type="button"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// Presentational wrapper
export const DynamicScroller: React.FC<{ sections?: Section[] }> = ({ sections = [] }) => (
  <div className="min-h-screen bg-gray-200">
    {sections.map((section, idx) => (
      <DynamicSection key={(section as any)?.id || idx} section={section} />
    ))}
  </div>
)

// Block renderer
type DynamicScrollerBlockLocal = DynamicScrollerBlockGen & { sections?: Section[] }
export const DynamicScrollerBlockComponent: React.FC<DynamicScrollerBlockLocal> = (props) => {
  return <DynamicScroller sections={props.sections || []} />
}
