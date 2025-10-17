// src/blocks/PackageHighlights/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { PackageHighlightsClient } from './Component.client'
import type { PackageHighlightsBlock } from '@/payload-types'

type PackageHighlightsProps = PackageHighlightsBlock & {
  slug?: string  // Package slug from page context
}

export const PackageHighlights = async (props: PackageHighlightsProps) => {
  const { dataSource, package: pkgProp, slug, ...manualData } = props as any

  // Manual mode - return as-is
  if (dataSource === 'manual') {
    return <PackageHighlightsClient {...manualData} />
  }

  const payload = await getPayload({ config: configPromise })
  let highlightsData: any = {}

  try {
    let pkgId: string | undefined

    // Get package ID
    if (dataSource === 'auto' && slug) {
      console.log('🎯 Auto-detecting package from slug:', slug)
      
      const pkg = await payload.find({
        collection: 'packages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      })
      
      if (pkg.docs[0]) {
        pkgId = pkg.docs[0].id
        console.log('✅ Found package:', pkg.docs[0].name)
      }
    } else if (dataSource === 'package' && pkgProp) {
      pkgId = typeof pkgProp === 'object' ? pkgProp.id : pkgProp
      console.log('📦 Using selected package:', pkgId)
    }

    // Fetch package data
    if (pkgId) {
      const pkg = await payload.findByID({
        collection: 'packages',
        id: pkgId,
        depth: 2,
      })

      // Transform highlights from Package schema
      // Package highlights have { icon, text } - we only need text
      const transformedHighlights = (pkg.highlights || []).map((h: any) => ({
        highlightText: h.text || h.highlightText || ''
      }))

      // Get gallery images from package gallery (first 7)
      const galleryArray = Array.isArray(pkg.gallery) ? pkg.gallery : []
      const transformedGallery = galleryArray.slice(0, 7).map((img: any) => ({
        image: img
      }))

      // Fill remaining slots if less than 7 images
      while (transformedGallery.length < 7) {
        transformedGallery.push({ image: pkg.heroImage })
      }

      highlightsData = {
        heading: `${pkg.name} Highlights`,
        subheading: pkg.tagline || pkg.summary || 'Discover what makes this package special',
        highlights: transformedHighlights,
        galleryImages: transformedGallery,
      }

      console.log(`✅ Loaded ${transformedHighlights.length} highlights and ${transformedGallery.length} images`)
    }

  } catch (error) {
    console.error('❌ PackageHighlights error:', error)
  }

  return <PackageHighlightsClient {...highlightsData} />
}

export default PackageHighlights
