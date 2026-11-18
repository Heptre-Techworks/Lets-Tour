import type { Metadata } from 'next'

import { generateMeta } from './generateMeta'

/**
 * Google title / description for Package and Destination pages.
 *
 * Priority for each of title / description, independently:
 *   1. the value typed in the admin (SEO tab → `meta.title` / `meta.description`)
 *   2. an automatic one built from the page's own data (name, nights/days, price, overview)
 */

const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

const formatPrice = (amount?: number | null, currency?: string | null): string | null => {
  if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) return null
  const cur = currency || 'INR'
  const num = Math.round(amount).toLocaleString('en-IN')
  return SYMBOLS[cur] ? `${SYMBOLS[cur]}${num}` : `${cur} ${num}`
}

const plural = (n: string | number, word: string) => `${n} ${word}${Number(n) === 1 ? '' : 's'}`

/** "8N/9D", "7 Days / 8 Nights", "5 nights 6 days" → "8 Nights / 9 Days". Unknown text is kept as typed. */
export const formatDuration = (raw?: string | null): string | null => {
  if (!raw || !String(raw).trim()) return null
  const s = String(raw)
  const nights = s.match(/(\d+)\s*(?:n\b|nights?)/i)?.[1]
  const days = s.match(/(\d+)\s*(?:d\b|days?)/i)?.[1]
  if (nights && days) return `${plural(nights, 'Night')} / ${plural(days, 'Day')}`
  if (nights) return plural(nights, 'Night')
  if (days) return plural(days, 'Day')
  return s.trim()
}

/** Plain text out of a Lexical rich-text value (or a plain string). */
export const richTextToPlain = (value: any): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  const parts: string[] = []
  const walk = (node: any) => {
    if (!node) return
    if (typeof node.text === 'string') parts.push(node.text)
    if (Array.isArray(node.children)) {
      node.children.forEach(walk)
      if (node.type === 'paragraph' || node.type === 'heading') parts.push(' ')
    }
  }
  walk(value.root ?? value)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

const clip = (text: string, max: number) => {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

const adminMeta = (doc: any) => ({
  title: typeof doc?.meta?.title === 'string' ? doc.meta.title.trim() : '',
  description: typeof doc?.meta?.description === 'string' ? doc.meta.description.trim() : '',
})

const finish = (doc: any, title: string, description: string, fallbackImage?: any): Promise<Metadata> =>
  generateMeta({
    doc: {
      ...doc,
      meta: {
        ...(doc?.meta || {}),
        title,
        description,
        image: doc?.meta?.image || fallbackImage || undefined,
      },
    },
  })

export const generatePackageMeta = async (pkg: any): Promise<Metadata> => {
  const admin = adminMeta(pkg)
  const name = String(pkg?.name || '').trim()

  const duration = formatDuration(pkg?.duration)
  const discounted = typeof pkg?.discountedPrice === 'number' && pkg.discountedPrice > 0 ? pkg.discountedPrice : null
  const base = typeof pkg?.price === 'number' ? pkg.price : null
  const price = formatPrice(discounted && base ? Math.min(discounted, base) : (discounted ?? base), pkg?.currency)

  const autoTitle = (() => {
    const head = /package|tour/i.test(name) ? name : `${name} Tour Package`
    const tail = [duration, price ? `from ${price}` : null].filter(Boolean).join(' ')
    return name ? (tail ? `${head} – ${tail}` : head) : ''
  })()

  const cities = Array.isArray(pkg?.cities)
    ? pkg.cities
        .map((c: any) => (c?.city && typeof c.city === 'object' ? c.city.name : c?.name))
        .filter(Boolean)
    : []
  const autoDescription = (() => {
    const fromOverview = richTextToPlain(pkg?.overview)
    if (fromOverview) return clip(fromOverview, 155)
    if (pkg?.tagline) return clip(String(pkg.tagline), 155)
    return clip(
      `${name}${duration ? ` – ${duration}` : ''}${cities.length ? ` covering ${cities.slice(0, 4).join(', ')}` : ''}. ` +
        `Check dates, price${price ? ` (from ${price} per person)` : ''} and book online with Let's Tour.`,
      155,
    )
  })()

  return finish(pkg, admin.title || autoTitle || "Let's Tour", admin.description || autoDescription, pkg?.heroImage)
}

export const generateDestinationMeta = async (dest: any): Promise<Metadata> => {
  const admin = adminMeta(dest)
  const name = String(dest?.name || '').trim()
  const price = formatPrice(dest?.startingPrice, dest?.currency)

  const autoTitle = name
    ? `${name} Tour Packages${price ? ` – Holiday Packages from ${price}` : ' – Itineraries, Prices & Booking'}`
    : ''

  const autoDescription = (() => {
    const fromText = richTextToPlain(dest?.shortDescription) || richTextToPlain(dest?.description)
    if (fromText) return clip(fromText, 155)
    if (dest?.heroData?.tagline) return clip(String(dest.heroData.tagline), 155)
    return clip(
      `Explore ${name} tour packages${price ? ` starting from ${price} per person` : ''}. ` +
        `Compare itineraries, dates and prices and book online with Let's Tour.`,
      155,
    )
  })()

  return finish(dest, admin.title || autoTitle || "Let's Tour", admin.description || autoDescription, dest?.coverImage || dest?.featuredImage)
}
