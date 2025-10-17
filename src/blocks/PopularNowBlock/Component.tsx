// src/blocks/PopularNow/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PopularNowClient } from './Component.client'
import type { PopularNowBlock } from '@/payload-types'

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[currency] || '₹'
}

export const PopularNow = async (props: PopularNowBlock) => {
  const { rows, ...rest } = props as any

  console.log('🎯 PopularNow - Number of rows:', rows?.length)

  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('⚠️ PopularNow - No rows configured')
    return <PopularNowClient {...rest} rows={[]} />
  }

  const payload = await getPayload({ config: configPromise })
  
  const processedRows = await Promise.all(
    rows.map(async (row: any, rowIndex: number) => {
      // ✅ FIX: Use defaults if dataSource is missing
      const dataSource = row.dataSource || 'featured'  // Default to 'featured'
      const itemLimit = row.itemLimit || 10  // Default to 10
      const cards = row.cards

      console.log(`🔄 Row ${rowIndex + 1} - DataSource: ${dataSource}, Limit: ${itemLimit}`)

      if (dataSource === 'manual') {
        console.log(`📝 Row ${rowIndex + 1} - Using manual cards:`, cards?.length || 0)
        return { 
          direction: row.direction || 'left',
          speedSeconds: row.speedSeconds || 40,
          cards: cards || [] 
        }
      }

      let fetchedCards: any[] = []

      try {
        // Destinations
        if (['featured', 'popular', 'inSeason'].includes(dataSource)) {
          const query: any = {
            limit: itemLimit,
            depth: 2,
            where: {
              isPublished: { equals: true },
            },
            sort: '-popularityScore',
          }

          if (dataSource === 'featured') {
            query.where.isFeatured = { equals: true }
            console.log(`⭐ Row ${rowIndex + 1} - Fetching featured destinations`)
          } else if (dataSource === 'popular') {
            query.where.isPopular = { equals: true }
            console.log(`🔥 Row ${rowIndex + 1} - Fetching popular destinations`)
          } else if (dataSource === 'inSeason') {
            query.where.isInSeason = { equals: true }
            console.log(`🌸 Row ${rowIndex + 1} - Fetching in-season destinations`)
          }

          const result = await payload.find({
            collection: 'destinations',
            ...query,
          })

          console.log(`✅ Row ${rowIndex + 1} - Found ${result.docs.length} destinations`)

          fetchedCards = result.docs.map((dest: any) => {
            const currencySymbol = getCurrencySymbol(dest.currency || 'INR')
            return {
              name: dest.name,
              price: dest.startingPrice
                ? `${currencySymbol}${dest.startingPrice.toLocaleString()}`
                : 'Contact for pricing',
              image: dest.featuredImage,
              alt: dest.name,
            }
          })
        }

        // Packages
        else if (['featuredPackages', 'recentPackages', 'honeymoonPackages', 'familyPackages'].includes(dataSource)) {
          const query: any = {
            limit: itemLimit,
            depth: 2,
            where: {
              isPublished: { equals: true },
            },
          }

          if (dataSource === 'featuredPackages') {
            query.where.isFeatured = { equals: true }
            query.sort = '-rating'
            console.log(`⭐ Row ${rowIndex + 1} - Fetching featured packages`)
          } else if (dataSource === 'recentPackages') {
            query.sort = '-createdAt'
            console.log(`🆕 Row ${rowIndex + 1} - Fetching recent packages`)
          } else if (dataSource === 'honeymoonPackages') {
            query.where.isHoneymoon = { equals: true }
            query.sort = '-rating'
            console.log(`💑 Row ${rowIndex + 1} - Fetching honeymoon packages`)
          } else if (dataSource === 'familyPackages') {
            query.where.isFamilyFriendly = { equals: true }
            query.sort = '-rating'
            console.log(`👨‍👩‍👧‍👦 Row ${rowIndex + 1} - Fetching family packages`)
          }

          const result = await payload.find({
            collection: 'packages',
            ...query,
          })

          console.log(`✅ Row ${rowIndex + 1} - Found ${result.docs.length} packages`)

          fetchedCards = result.docs.map((pkg: any) => {
            const currencySymbol = getCurrencySymbol(pkg.currency || 'INR')
            const displayPrice = pkg.discountedPrice || pkg.price || 0

            return {
              name: pkg.name,
              price: `${currencySymbol}${displayPrice.toLocaleString()}`,
              image: pkg.heroImage,
              alt: pkg.name,
            }
          })
        }

      } catch (error) {
        console.error(`❌ Row ${rowIndex + 1} - Error:`, error)
      }

      return {
        direction: row.direction || 'left',
        speedSeconds: row.speedSeconds || 40,
        cards: fetchedCards,
      }
    })
  )

  console.log('✅ PopularNow - All rows processed')

  return <PopularNowClient {...rest} rows={processedRows} />
}

export default PopularNow
