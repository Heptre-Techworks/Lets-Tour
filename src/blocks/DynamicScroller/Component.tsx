// src/blocks/DynamicScroller/Component.tsx
'use client'

import React from 'react'
import type { DynamicScrollerBlock as DynamicScrollerBlockGen } from '@/payload-types'

// ---- Media shape (robust to partial population from Payload)
type MediaSize = { url?: string | null; width?: number; height?: number }
type Media =
  | {
      id: string
      url?: string | null
      filename?: string | null
      alt?: string | null
      sizes?: Record<string, MediaSize | undefined> | null
    }
  | string
  | null
  | undefined

// ---- Narrow useful shapes from generated types
type Section = NonNullable<DynamicScrollerBlockGen['sections']>[number]
type Item = NonNullable<Section['items']>[number]
type ItineraryActivity = {
  icon?: Media
  description: string
  detailsImage?: Media
}

// ---- Utils (unchanged design/logic)
function resolveMediaUrl(
  media: Media,
  opts?: { size?: string; baseURL?: string; uploadsBase?: string }
): string | undefined {
  const baseURL = opts?.baseURL ?? ''
  const uploadsBase = opts?.uploadsBase ?? '/media'

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

function resolveMediaAlt(media: Media, fallback: string): string {
  if (media && typeof media === 'object' && 'id' in media) {
    const m = media as Exclude<Media, string | null | undefined> & { id: string }
    return (m.alt ?? '').trim() || fallback
  }
  return fallback
}

// ---- Type guards
const isPackageItem = (item: Item): item is Item & { blockType: 'packageItem' } =>
  item?.blockType === 'packageItem'
const isItineraryDay = (item: Item): item is Item & { blockType: 'itineraryDay' } =>
  item?.blockType === 'itineraryDay'

// ---- Icons
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

// ---- Dashed rule (unchanged design/values)
const DashedRule: React.FC<{ className?: string }> = ({ className }) => {
  const style: React.CSSProperties = {
    ['--dash' as any]: '10px',
    ['--gap' as any]: '10px',
    ['--offset' as any]: '50px',
    backgroundImage:
      'repeating-linear-gradient(to right, currentColor 0 var(--dash), transparent 0 calc(var(--dash) + var(--gap)))',
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'calc(var(--dash) + var(--gap)) 1px',
    backgroundPosition: 'var(--offset) 0',
    height: '1px',
    width: '100%',
    opacity: 0.65,
  }
  return <div style={style} className={className} aria-hidden />
}

// ---- Cards (unchanged design)
const PackageCard: React.FC<{ item: Extract<Item, { blockType: 'packageItem' }> }> = ({ item }) => {
  const title = (item as any).title as string
  const image = (item as any).image as Media
  const price = (item as any).price as string
  const src = resolveMediaUrl(image)
  const alt = resolveMediaAlt(image, title)

  return (
    <div className="relative w-72 h-96 flex-shrink-0 snap-center rounded-2xl shadow-lg overflow-hidden group bg-black/5">
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

      {(item as any).tag && (
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${(item as any).tagColor || 'bg-white/90 text-gray-900'}`}>
            {(item as any).tag as string}
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-black/30 p-2 rounded-full cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 p-5 text-white w-full">
        <h3 className="text-3xl font-bold font-amiri">{title}</h3>
        <hr className="my-2 border-white/50" />
        <p className="text-sm mt-1">
          Packages starting at <br />
          <span className="font-bold text-lg">₹ {price}</span> /person
        </p>
      </div>
    </div>
  )
}

const ItineraryCard: React.FC<{ item: Extract<Item, { blockType: 'itineraryDay' }> }> = ({ item }) => {
  const activities = ((item as any).activities || []) as ItineraryActivity[]
  return (
    <div className="w-96 flex-shrink-0 snap-start bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-6 font-amiri">{(item as any).day as string}</h3>
      <div className="space-y-4">
        {activities.map((activity: ItineraryActivity, idx: number) => {
          const iconSrc = activity.icon ? resolveMediaUrl(activity.icon) : undefined
          const detailsSrc = activity.detailsImage ? resolveMediaUrl(activity.detailsImage) : undefined
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

// ---- Section (unchanged design)
const DynamicSection: React.FC<{ section: Section }> = ({ section }) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(1)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement | undefined)?.clientWidth || 0
    const gap = 24 // gap-6
    const scrollAmount = cardWidth + gap
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  const items = (section.items || []) as Item[]
  const isPackage = section.type === 'package'
  const packageItems = items.filter(isPackageItem)
  const packagesCount = packageItems.length

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      const scroller = scrollRef.current
      if (!scroller) return
      const scrollLeft = scroller.scrollLeft
      const cardWidth = (scroller.children[0] as HTMLElement | undefined)?.clientWidth || 0
      const gap = 24
      const activeIndex = Math.round(scrollLeft / (cardWidth + gap))
      setCurrentIndex(activeIndex + 1)
    }, 150)
  }

  React.useEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (scroller) scroller.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [packageItems.length])

  const buttonClass =
    'w-12 h-12 rounded-full flex items-center justify-center bg-black text-white shadow-md transition-transform hover:scale-110'

  // Some Payload projects store navigation as a group object, others as a boolean—treat truthy as enabled without changing UI
  const navEnabled = Boolean((section as any).navigation ?? false)

  return (
    <section className={`relative py-12 overflow-hidden ${section?.theme?.background || 'bg-white'}`}>
      <div className="absolute top-36 left-0 h-96 w-1/3 bg-yellow-300/50" aria-hidden="true" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {(section.title || section.subtitle) && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              {section.title && (
                <h2 className={`text-4xl font-bold font-amiri ${section?.theme?.titleColor || 'text-gray-900'}`}>
                  {section.title}
                </h2>
              )}
              <div className="flex-1"><DashedRule /></div>
            </div>
            {section.subtitle && (
              <p className={`mt-2 ${section?.theme?.subtitleColor || 'text-gray-900'}`}>{section.subtitle}</p>
            )}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' } as any}
        >
          {isPackage && packageItems.map((item, idx) => <PackageCard key={(item as any).id || idx} item={item as any} />)}
          {section.type === 'itinerary' &&
            items.filter(isItineraryDay).map((item, idx) => <ItineraryCard key={(item as any).day || idx} item={item as any} />)}
        </div>

        {isPackage && navEnabled && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Previous" type="button"><ChevronLeft /></button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Next" type="button"><ChevronRight /></button>
              </div>
              <div className="mx-3 flex-1"><DashedRule /></div>
              <div className="pr-2">
                <span className="text-3xl font-semibold text-gray-900 tabular-nums">
                  {currentIndex}/{packagesCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {section.type === 'itinerary' && navEnabled && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex-1 mr-3"><DashedRule /></div>
              <div className="flex items-center gap-2">
                <button onClick={() => scroll('left')} className={buttonClass} aria-label="Previous" type="button"><ChevronLeft /></button>
                <button onClick={() => scroll('right')} className={buttonClass} aria-label="Next" type="button"><ChevronRight /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ---- Presentational wrapper (unchanged design)
export const DynamicScroller: React.FC<{ sections?: Section[] }> = ({ sections = [] }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
      .font-amiri { font-family: 'Amiri', serif; }
    `}</style>
    <div className="min-h-screen bg-gray-50 font-sans">
      {sections.map((section, idx) => (
        <DynamicSection key={(section as any)?.id || idx} section={section} />
      ))}
    </div>
  </>
)

// ---- Block renderer compatible with Payload generated types
type DynamicScrollerBlockLocal = DynamicScrollerBlockGen & { sections?: Section[] }
export const DynamicScrollerBlockComponent: React.FC<DynamicScrollerBlockLocal> = (props) => {
  return <DynamicScroller sections={props.sections || []} />
}

export default DynamicScrollerBlockComponent
