// src/blocks/TravelPackageExplorer/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { TravelPackageExplorerClient } from './Component.client'
import type { TravelPackageExplorerBlock } from '@/payload-types'

type TravelPackageExplorerProps = TravelPackageExplorerBlock & {
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

const parseDuration = (durationStr: string): number => {
  // Parse "8N/9D" or "7 Days / 8 Nights" to number of days
  const match = durationStr.match(/(\d+)\s*(N|D|Days?|Nights?)/i)
  return match ? parseInt(match[1], 10) : 0
}

const safelyExtractName = (val: any) => (typeof val === 'object' ? val?.name : val)

export const TravelPackageExplorer = async (props: TravelPackageExplorerProps) => {
  const { dataSource, destination: destProp, slug } = props as any

  const payload = await getPayload({ config: configPromise })
  let packages: any[] = []

  try {
    let destId: string | undefined

    // Get destination ID
    if (dataSource === 'auto' && slug) {
      console.log('🎯 Auto-detecting destination from slug:', slug)

      const dest = await payload.find({
        collection: 'destinations',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })

      if (dest.docs[0]) {
        destId = dest.docs[0].id
        console.log('✅ Found destination:', dest.docs[0].name)
      }
    } else if (dataSource === 'destination' && destProp) {
      destId = typeof destProp === 'object' ? destProp.id : destProp
    }

    // Fetch packages
    const query: any = {
      depth: 2,
      where: {
        isPublished: { equals: true },
      },
    }

    if (destId && dataSource !== 'all') {
      query.where.destinations = { contains: destId }
    }

    const result = await payload.find({
      collection: 'packages',
      ...query,
      limit: 100,
    })

    console.log(`✅ Found ${result.docs.length} packages`)

    // Transform packages to UI format
    packages = result.docs.map((pkg: any) => {
      // Get accommodation types names
      const accommodationTypes = Array.isArray(pkg.accommodationTypes)
        ? pkg.accommodationTypes
            .map((a: any) => (typeof a === 'object' ? a.name : ''))
            .filter(Boolean)
        : []

      // Get amenities names
      const amenities = Array.isArray(pkg.amenities)
        ? pkg.amenities.map((a: any) => (typeof a === 'object' ? a.name : '')).filter(Boolean)
        : []

      // Get experiences (categories)
      const experiences = Array.isArray(pkg.categories)
        ? pkg.categories.map((c: any) => (typeof c === 'object' ? c.name : '')).filter(Boolean)
        : []

      // Get inclusions
      const inclusions = Array.isArray(pkg.inclusions)
        ? pkg.inclusions
            .map((inc: any) => (typeof inc === 'object' ? inc.name || inc.description : ''))
            .filter(Boolean)
            .slice(0, 6) // Limit to 6 for UI
        : []

      // Get places/sights from itinerary
      const sights: string[] = []
      if (Array.isArray(pkg.itinerary)) {
        pkg.itinerary.forEach((day: any) => {
          if (Array.isArray(day.places)) {
            day.places.forEach((place: any) => {
              const placeName = typeof place === 'object' ? place.name : ''
              if (placeName && !sights.includes(placeName)) {
                sights.push(placeName)
              }
            })
          }
        })
      }

      // Get destination for province/location
      const firstDest =
        Array.isArray(pkg.destinations) && pkg.destinations[0]
          ? typeof pkg.destinations[0] === 'object'
            ? pkg.destinations[0]
            : null
          : null

      const currencySymbol = getCurrencySymbol(pkg.currency || 'INR')

      return {
        id: pkg.id,
        slug: pkg.slug, // ✅ ADD
        href: `/packages/${pkg.slug}`, // ✅ ADD
        title: pkg.name,
        location: firstDest?.name || pkg.Summary || '',
        description: pkg.Summary || '',
        price: pkg.discountedPrice || pkg.price || 0,
        originalPrice: pkg.price || 0,
        duration: parseDuration(pkg.duration || '0'),
        rating: pkg.starRating || pkg.rating || 4,
        image: pkg.heroImage,
        experiences,
        accommodationType: accommodationTypes[0] || 'Hotel',
        amenities,
        inclusions,
        province: safelyExtractName(firstDest?.country) || firstDest?.name || '',
        sights: sights.slice(0, 10), // Limit to 10 sights
        recentBookings: pkg.bookingsCount30d || 0,
        suitability: {
          couples: pkg.isHoneymoon ? 90 : 50,
          family: pkg.isFamilyFriendly ? 85 : 50,
        },
      }
    })
  } catch (error) {
    console.error('❌ TravelPackageExplorer error:', error)
  }

  return <TravelPackageExplorerClient packages={packages} />
}

export default TravelPackageExplorer
