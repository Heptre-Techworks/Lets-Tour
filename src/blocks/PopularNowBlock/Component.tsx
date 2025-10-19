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

const getImageUrl = (image: any): string => {
  if (!image) return ''
  return typeof image === 'object' ? image?.url || '' : image
}

export const PopularNow = async (props: PopularNowBlock) => {
  const { rows, id, ...rest } = props as any

  console.log('🎯 PopularNow - Block ID:', id)

  const payload = await getPayload({ config: configPromise })

  let populatedRows = rows

  // Re-query page with depth to get populated data
  if (Array.isArray(rows) && rows.length > 0) {
    try {
      const pagesResult = await payload.find({
        collection: 'pages',
        depth: 3,
        limit: 1,
        where: {
          'layout.id': { equals: id }
        }
      })

      if (pagesResult.docs.length > 0) {
        const page = pagesResult.docs[0]
        const layout = (page as any).layout || []
        const popularNowBlock = layout.find((block: any) => block.id === id && block.blockType === 'popularNow')
        
        if (popularNowBlock && popularNowBlock.rows) {
          populatedRows = popularNowBlock.rows
          console.log('✅ Got populated rows')
        }
      }
    } catch (error) {
      console.error('❌ Error fetching populated data:', error)
    }
  }

  if (!Array.isArray(populatedRows) || populatedRows.length === 0) {
    console.warn('⚠️ No rows configured')
    return <PopularNowClient {...rest} rows={[]} />
  }
  
  const processedRows = await Promise.all(
    populatedRows.map(async (row: any, rowIndex: number) => {
      const dataSource = row?.dataSource || 'manual'
      const itemLimit = row?.itemLimit || 10
      const direction = row?.direction || 'left'
      const speedSeconds = row?.speedSeconds || 40

      console.log(`\n🔄 Row ${rowIndex + 1}:`)
      console.log(`   DataSource: "${dataSource}"`)
      console.log(`   Direction: "${direction}"`)
      console.log(`   Speed: ${speedSeconds}s`)

      // MANUAL MODE
      if (dataSource === 'manual') {
        const manualCards = row?.cards || []
        console.log(`   Cards: ${manualCards.length}`)
        
        const cards = manualCards.map((card: any) => ({
          name: card.name || '',
          price: card.price || '',
          image: card.image,
          imageUrl: getImageUrl(card.image),
          alt: card.alt || card.name,
          href: '#',  // ✅ Manual cards have no slug
        }))
        
        return {
          direction: direction,
          speedSeconds: speedSeconds,
          cards: cards,
        }
      }

      // AUTO-POPULATE MODE
      let fetchedCards: any[] = []

      try {
        if (['featured-destinations', 'popular-destinations', 'in-season-destinations'].includes(dataSource)) {
          const query: any = {
            limit: itemLimit,
            depth: 2,
            where: { isPublished: { equals: true } },
            sort: '-popularityScore',
          }

          if (dataSource === 'featured-destinations') {
            query.where.isFeatured = { equals: true }
          } else if (dataSource === 'popular-destinations') {
            query.where.isPopular = { equals: true }
          } else if (dataSource === 'in-season-destinations') {
            query.where.isInSeason = { equals: true }
          }

          const result = await payload.find({ collection: 'destinations', ...query })
          console.log(`   Found ${result.docs.length} destinations`)

          fetchedCards = result.docs.map((dest: any) => {
            const currencySymbol = getCurrencySymbol(dest.currency || 'INR')
            return {
              name: dest.name,
              price: dest.startingPrice
                ? `${currencySymbol}${dest.startingPrice.toLocaleString()}`
                : 'Contact for pricing',
              image: dest.featuredImage,
              imageUrl: getImageUrl(dest.featuredImage),
              alt: dest.name,
              slug: dest.slug,  // ✅ ADD
              href: `/destinations/${dest.slug}`,  // ✅ ADD
            }
          })
        }
        else if (['featured-packages', 'recent-packages', 'honeymoon-packages', 'family-packages'].includes(dataSource)) {
          const query: any = {
            limit: itemLimit,
            depth: 2,
            where: { isPublished: { equals: true } },
          }

          if (dataSource === 'featured-packages') {
            query.where.isFeatured = { equals: true }
            query.sort = '-rating'
          } else if (dataSource === 'recent-packages') {
            query.sort = '-createdAt'
          } else if (dataSource === 'honeymoon-packages') {
            query.where.isHoneymoon = { equals: true }
            query.sort = '-rating'
          } else if (dataSource === 'family-packages') {
            query.where.isFamilyFriendly = { equals: true }
            query.sort = '-rating'
          }

          const result = await payload.find({ collection: 'packages', ...query })
          console.log(`   Found ${result.docs.length} packages`)

          fetchedCards = result.docs.map((pkg: any) => {
            const currencySymbol = getCurrencySymbol(pkg.currency || 'INR')
            const displayPrice = pkg.discountedPrice || pkg.price || 0
            return {
              name: pkg.name,
              price: `${currencySymbol}${displayPrice.toLocaleString()}`,
              image: pkg.heroImage,
              imageUrl: getImageUrl(pkg.heroImage),
              alt: pkg.name,
              slug: pkg.slug,  // ✅ ADD
              href: `/packages/${pkg.slug}`,  // ✅ ADD
            }
          })
        }
      } catch (error) {
        console.error(`❌ Error:`, error)
      }

      return {
        direction: direction,
        speedSeconds: speedSeconds,
        cards: fetchedCards,
      }
    })
  )

  console.log('✅ Final result:', processedRows.map((r, i) => 
    `Row ${i+1}: ${r.cards.length} cards, ${r.direction}, ${r.speedSeconds}s`
  ).join(' | '))

  return <PopularNowClient {...rest} rows={processedRows} />
}

export default PopularNow
