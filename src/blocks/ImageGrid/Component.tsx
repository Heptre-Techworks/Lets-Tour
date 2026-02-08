// src/blocks/ImageGrid/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ImageGridClient } from './Component.client'
import type { ImageGridBlock } from '@/payload-types'

export const ImageGrid = async (props: ImageGridBlock) => {
  const {
    dataSource,
    destination: destProp,
    package: pkgProp,
    featuredLimit,
    manualData,
    ...rest
  } = props as any

  // Manual mode - return as-is
  if (dataSource === 'manual' && manualData) {
    return <ImageGridClient {...manualData} theme={rest.theme} labels={rest.labels} />
  }

  const payload = await getPayload({ config: configPromise })
  let gridData: any = {}

  try {
    let destId: string | undefined

    // Get destination ID based on source
    if (dataSource === 'destination' && destProp) {
      destId = typeof destProp === 'object' ? destProp.id : destProp
    } else if (dataSource === 'package' && pkgProp) {
      const pkgId = typeof pkgProp === 'object' ? pkgProp.id : pkgProp
      const pkgObj = await payload.findByID({ collection: 'packages', id: pkgId, depth: 2 })
      const pkgDest = pkgObj?.destinations?.[0]
      destId = typeof pkgDest === 'object' ? pkgDest?.id : pkgDest
    } else if (dataSource === 'featured') {
      // Featured destinations
      const featured = await payload.find({
        collection: 'destinations',
        where: { isFeatured: { equals: true } },
        limit: featuredLimit || 4,
        depth: 2,
      })

      // Helper to safely get name from string or object
      const safelyExtractName = (val: any) => (typeof val === 'object' ? val?.name : val)

      gridData = {
        leftHero: {
          title: 'Explore Destinations',
          rating: 5,
          trail: 'Top-rated destinations',
          image: featured.docs[0]?.featuredImage,
        },
        explore: {
          subtitle: 'DISCOVER',
          title: 'Featured Destinations',
          description: 'Handpicked destinations for unforgettable journeys',
          button: {
            label: 'View All',
            href: '/destinations',
          },
        },
        spots: featured.docs.slice(0, 3).map((dest: any) => ({
          name: dest.name,
          rating: dest.popularityScore || 5,
          location: safelyExtractName(dest.country) || dest.continent,
          image: dest.featuredImage,
        })),
        activities: {
          subtitle: 'ADVENTURES',
          title: 'Unique Experiences',
          description: 'Explore activities across featured destinations',
          button: {
            label: 'Browse Packages',
            href: '/packages',
          },
          tag: `${featured.docs.length}+ destinations`,
          image: featured.docs[0]?.gallery?.[0] || featured.docs[0]?.coverImage,
        },
      }

      return <ImageGridClient {...gridData} theme={rest.theme} labels={rest.labels} />
    }

    // Fetch destination data
    if (destId) {
      const dest = await payload.findByID({
        collection: 'destinations',
        id: destId,
        depth: 2,
      })

      const places = await payload.find({
        collection: 'places',
        where: { destination: { equals: destId } },
        limit: 3,
        depth: 2,
        sort: '-rating',
      })

      const activities = await payload.find({
        collection: 'activities',
        where: { destination: { equals: destId } },
        limit: 5,
        depth: 1,
      })

      const packages = await payload.find({
        collection: 'packages',
        where: {
          destinations: { contains: destId },
          isPublished: { equals: true },
        },
        limit: 1,
        depth: 0,
      })

      gridData = {
        leftHero: {
          title: dest.name,
          rating: dest.popularityScore ? dest.popularityScore / 20 : 4.5, // ✅ Convert popularityScore (0-100) to 5-star rating
          trail: dest.heroData?.tagline || dest.shortDescription, // ✅ heroData.tagline or shortDescription
          image: dest.featuredImage, // ✅ featuredImage
        },
        explore: {
          subtitle: 'EXPLORE',
          title: `Discover ${dest.name}`,
          description: dest.shortDescription || `Experience ${dest.name}`, // ✅ shortDescription
          button: {
            label: `View ${packages.totalDocs || 0} Packages`,
            href: `/destinations/${dest.slug}`,
          },
        },
        spots: places.docs.map((place: any) => ({
          name: place.name,
          rating: place.rating || 4.0,
          location: place.location || dest.name,
          image: place.images?.[0] || place.featuredImage,
        })),
        activities: {
          subtitle: 'ACTIVITIES',
          title: `Things to do in ${dest.name}`,
          description:
            activities.docs.length > 0
              ? `${activities.docs.length}+ curated activities`
              : 'Discover unique experiences',
          button: {
            label: 'Explore',
            href: `/destinations/${dest.slug}#activities`,
          },
          tag: activities.docs.length > 0 ? `${activities.docs.length}+ activities` : undefined,
          image: dest.gallery?.[0] || dest.coverImage, // ✅ coverImage
        },
      }
    }
  } catch (error) {
    console.error('❌ ImageGrid error:', error)
  }

  return <ImageGridClient {...gridData} theme={rest.theme} labels={rest.labels} />
}

export default ImageGrid
