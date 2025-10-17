// src/blocks/PopularNow/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PopularNowClient } from './Component.client'
import type { PopularNowBlock } from '@/payload-types'

type PopularNowProps = PopularNowBlock & {
  slug?: string  // Optional slug from page context
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

export const PopularNow = async (props: PopularNowProps) => {
  const { rows, ...rest } = props as any

  if (!Array.isArray(rows) || rows.length === 0) {
    return <PopularNowClient {...rest} rows={[]} />
  }

  const payload = await getPayload({ config: configPromise })
  
  // Process each row
  const processedRows = await Promise.all(
    rows.map(async (row: any) => {
      const { dataSource, itemLimit, cards, ...rowConfig } = row

      // Manual mode - return as-is
      if (dataSource === 'manual') {
        return { ...rowConfig, cards: cards || [] }
      }

      let fetchedCards: any[] = []

      try {
        // Fetch from collections
        switch (dataSource) {
          case 'featured-destinations':
            console.log('📍 Fetching featured destinations')
            const featuredDest = await payload.find({
              collection: 'destinations',
              where: {
                isFeatured: { equals: true },
                isPublished: { equals: true },
              },
              limit: itemLimit || 10,
              depth: 1,
              sort: '-popularityScore',
            })

            fetchedCards = featuredDest.docs.map((dest: any) => ({
              name: dest.name,
              price: dest.startingPrice
                ? `${getCurrencySymbol(dest.currency || 'INR')}${dest.startingPrice.toLocaleString()}`
                : 'Contact for pricing',
              image: dest.featuredImage,
              alt: dest.name,
            }))
            console.log(`✅ Loaded ${fetchedCards.length} featured destinations`)
            break

          case 'popular-destinations':
            console.log('📍 Fetching popular destinations')
            const popularDest = await payload.find({
              collection: 'destinations',
              where: {
                isPopular: { equals: true },
                isPublished: { equals: true },
              },
              limit: itemLimit || 10,
              depth: 1,
              sort: '-popularityScore',
            })

            fetchedCards = popularDest.docs.map((dest: any) => ({
              name: dest.name,
              price: dest.startingPrice
                ? `${getCurrencySymbol(dest.currency || 'INR')}${dest.startingPrice.toLocaleString()}`
                : 'Contact for pricing',
              image: dest.featuredImage,
              alt: dest.name,
            }))
            console.log(`✅ Loaded ${fetchedCards.length} popular destinations`)
            break

          case 'featured-packages':
            console.log('📦 Fetching featured packages')
            const featuredPkg = await payload.find({
              collection: 'packages',
              where: {
                isFeatured: { equals: true },
                isPublished: { equals: true },
              },
              limit: itemLimit || 10,
              depth: 1,
              sort: '-rating',
            })

            fetchedCards = featuredPkg.docs.map((pkg: any) => ({
              name: pkg.name,
              price: pkg.discountedPrice
                ? `${getCurrencySymbol(pkg.currency || 'INR')}${pkg.discountedPrice.toLocaleString()}`
                : pkg.price
                  ? `${getCurrencySymbol(pkg.currency || 'INR')}${pkg.price.toLocaleString()}`
                  : 'Contact for pricing',
              image: pkg.heroImage,
              alt: pkg.name,
            }))
            console.log(`✅ Loaded ${fetchedCards.length} featured packages`)
            break

          case 'recent-packages':
            console.log('📦 Fetching recent packages')
            const recentPkg = await payload.find({
              collection: 'packages',
              where: {
                isPublished: { equals: true },
              },
              limit: itemLimit || 10,
              depth: 1,
              sort: '-createdAt',
            })

            fetchedCards = recentPkg.docs.map((pkg: any) => ({
              name: pkg.name,
              price: pkg.discountedPrice
                ? `${getCurrencySymbol(pkg.currency || 'INR')}${pkg.discountedPrice.toLocaleString()}`
                : pkg.price
                  ? `${getCurrencySymbol(pkg.currency || 'INR')}${pkg.price.toLocaleString()}`
                  : 'Contact for pricing',
              image: pkg.heroImage,
              alt: pkg.name,
            }))
            console.log(`✅ Loaded ${fetchedCards.length} recent packages`)
            break

          default:
            fetchedCards = []
        }
      } catch (error) {
        console.error(`❌ Error fetching data for row with source ${dataSource}:`, error)
      }

      return {
        ...rowConfig,
        cards: fetchedCards,
      }
    })
  )

  return <PopularNowClient {...rest} rows={processedRows} />
}

export default PopularNow
