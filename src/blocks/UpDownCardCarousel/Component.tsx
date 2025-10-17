// src/blocks/UpDownCarousel/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { UpDownCardCarouselClient } from './Component.client'
import type { UpDownCardCarouselBlock } from '@/payload-types'

type UpDownCardCarouselProps = UpDownCardCarouselBlock & {
  slug?: string
}

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[currency] || '₹'
}

export const UpDownCardCarousel = async (props: UpDownCardCarouselProps) => {
  const { dataSource, itemLimit, cards: manualCards, ...rest } = props as any

  let cards = manualCards || []

  // Fetch from collections
  if (dataSource !== 'manual') {
    const payload = await getPayload({ config: configPromise })

    try {
      // Destinations
      if (['inSeason', 'featured', 'popular'].includes(dataSource)) {
        const query: any = {
          limit: itemLimit || 10,
          depth: 2,
          where: {
            isPublished: { equals: true },
          },
          sort: '-popularityScore',
        }

        if (dataSource === 'inSeason') {
          query.where.isInSeason = { equals: true }
          console.log('🌸 Fetching in-season destinations')
        } else if (dataSource === 'featured') {
          query.where.isFeatured = { equals: true }
          console.log('⭐ Fetching featured destinations')
        } else if (dataSource === 'popular') {
          query.where.isPopular = { equals: true }
          console.log('🔥 Fetching popular destinations')
        }

        const result = await payload.find({
          collection: 'destinations',
          ...query,
        })

        console.log(`✅ Found ${result.docs.length} destinations`)

        cards = result.docs.map((dest: any) => {
          const currencySymbol = getCurrencySymbol(dest.currency || 'INR')
          
          let discountLabel = ''
          if (dest.discount?.hasDiscount && dest.discount?.percentage) {
            discountLabel = dest.discount.label || `${dest.discount.percentage}% Off`
          }

          return {
            name: dest.name,
            details: dest.shortDescription || dest.locationDetails || '',
            price: dest.startingPrice || 0,
            discount: discountLabel,
            image: dest.featuredImage,
            alt: dest.name,
            href: `/destinations/${dest.slug}`,
          }
        })
      }

      // Packages
      else if (['featuredPackages', 'recentPackages', 'honeymoonPackages', 'familyPackages'].includes(dataSource)) {
        const query: any = {
          limit: itemLimit || 10,
          depth: 2,
          where: {
            isPublished: { equals: true },
          },
        }

        if (dataSource === 'featuredPackages') {
          query.where.isFeatured = { equals: true }
          query.sort = '-rating'
          console.log('⭐ Fetching featured packages')
        } else if (dataSource === 'recentPackages') {
          query.sort = '-createdAt'
          console.log('🆕 Fetching recent packages')
        } else if (dataSource === 'honeymoonPackages') {
          query.where.isHoneymoon = { equals: true }
          query.sort = '-rating'
          console.log('💑 Fetching honeymoon packages')
        } else if (dataSource === 'familyPackages') {
          query.where.isFamilyFriendly = { equals: true }
          query.sort = '-rating'
          console.log('👨‍👩‍👧‍👦 Fetching family packages')
        }

        const result = await payload.find({
          collection: 'packages',
          ...query,
        })

        console.log(`✅ Found ${result.docs.length} packages`)

        cards = result.docs.map((pkg: any) => {
          const currencySymbol = getCurrencySymbol(pkg.currency || 'INR')
          
          // Calculate discount if exists
          let discountLabel = ''
          if (pkg.discountedPrice && pkg.price && pkg.discountedPrice < pkg.price) {
            const discountPercent = Math.round(((pkg.price - pkg.discountedPrice) / pkg.price) * 100)
            discountLabel = `${discountPercent}% Off`
          }

          // Use discounted price if available
          const displayPrice = pkg.discountedPrice || pkg.price || 0

          return {
            name: pkg.name,
            details: pkg.summary || pkg.tagline || '',
            price: displayPrice,
            discount: discountLabel,
            image: pkg.heroImage,
            alt: pkg.name,
            href: `/packages/${pkg.slug}`,
          }
        })
      }

    } catch (error) {
      console.error('❌ UpDownCardCarousel error:', error)
    }
  }

  return <UpDownCardCarouselClient {...rest} cards={cards} />
}

export default UpDownCardCarousel
