import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PackageHighlightsClient } from './Component.client'
import type { PackageHighlightsBlock } from '@/payload-types'

type PackageHighlightsProps = PackageHighlightsBlock

export const PackageHighlights = async (props: PackageHighlightsProps) => {
  const { dataSource, package: pkgProp, ...manualData } = props as any

  console.log('📦 PackageHighlights server props:', {
    dataSource,
    hasPackage: !!pkgProp,
    packageType: typeof pkgProp,
  })

  // Manual mode - return as-is
  if (dataSource === 'manual') {
    console.log('📝 Using manual mode')
    return <PackageHighlightsClient {...manualData} dataSource="manual" />
  }

  // Auto mode - pass to client for URL-based fetching
  if (dataSource === 'auto') {
    console.log('🔄 Auto mode - client will fetch from URL')
    return (
      <PackageHighlightsClient 
        dataSource="auto"
        heading=""
        subheading=""
        highlights={[]}
        galleryImages={[]}
      />
    )
  }

  // Package selection mode - fetch on server
  if (dataSource === 'package' && pkgProp) {
    const payload = await getPayload({ config: configPromise })
    
    try {
      let pkgData: any = null

      // Check if already populated
      if (typeof pkgProp === 'object' && pkgProp.id) {
        pkgData = pkgProp
        console.log('✅ Using populated package:', pkgData.name)
      } else {
        // Need to fetch
        const pkgId = typeof pkgProp === 'string' ? pkgProp : pkgProp
        pkgData = await payload.findByID({
          collection: 'packages',
          id: pkgId,
          depth: 2,
        })
        console.log('✅ Fetched package:', pkgData.name)
      }

      if (pkgData) {
        // Transform highlights from Package schema
        const transformedHighlights = (pkgData.highlights || []).map((h: any) => ({
          highlightText: h.text || ''
        }))

        // Get gallery images from package gallery (first 7)
        const galleryArray = Array.isArray(pkgData.gallery) ? pkgData.gallery : []
        const transformedGallery = galleryArray.slice(0, 7).map((img: any) => ({
          image: img
        }))

        // Fill remaining slots if less than 7 images
        while (transformedGallery.length < 7 && pkgData.heroImage) {
          transformedGallery.push({ image: pkgData.heroImage })
        }

        const highlightsData = {
          dataSource: 'package',
          heading: `${pkgData.name} Highlights`,
          subheading: pkgData.tagline || pkgData.summary || 'Discover what makes this package special',
          highlights: transformedHighlights,
          galleryImages: transformedGallery,
        }

        console.log(`✅ Server loaded ${transformedHighlights.length} highlights, ${transformedGallery.length} images`)

        return <PackageHighlightsClient {...highlightsData} />
      }
    } catch (error) {
      console.error('❌ PackageHighlights server error:', error)
    }
  }

  // Fallback - empty state
  console.warn('⚠️ No valid data source, rendering empty')
  return (
    <PackageHighlightsClient
      dataSource="manual"
      heading="Package highlights"
      subheading="No data available"
      highlights={[]}
      galleryImages={[]}
    />
  )
}

export default PackageHighlights
