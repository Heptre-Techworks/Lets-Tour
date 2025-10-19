import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeatureCarouselClient } from './Component.client'
import type { FeatureCarouselBlock } from '@/payload-types'

type FeatureCarouselProps = FeatureCarouselBlock

export const FeatureCarousel = async (props: FeatureCarouselProps) => {
  const { dataSource, package: pkgProp, featureSource, ...manualData } = props as any

  console.log('🎠 FeatureCarousel server props:', {
    dataSource,
    featureSource,
    hasPackage: !!pkgProp,
    packageType: typeof pkgProp,
  })

  // Manual mode - return as-is
  if (dataSource === 'manual') {
    console.log('📝 Using manual mode')
    return (
      <FeatureCarouselClient 
        {...manualData} 
        dataSource="manual"
      />
    )
  }

  // Auto mode - pass to client for URL-based fetching
  if (dataSource === 'auto') {
    console.log('🔄 Auto mode - client will fetch from URL')
    return (
      <FeatureCarouselClient 
        dataSource="auto"
        featureSource={featureSource || 'highlights'}
        heading=""
        subheading=""
        cards={[]}
        showNavigationButtons={manualData.showNavigationButtons ?? true}
        scrollPercentage={manualData.scrollPercentage ?? 80}
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
        const cards = transformPackageToCards(pkgData, featureSource || 'highlights')
        const heading = getHeadingForSource(pkgData.name, featureSource)
        const subheading = getSubheadingForSource(pkgData, featureSource)

        console.log(`✅ Server loaded ${cards.length} feature cards from ${featureSource}`)

        return (
          <FeatureCarouselClient
            dataSource="package"
            heading={heading}
            subheading={subheading}
            cards={cards}
            showNavigationButtons={manualData.showNavigationButtons ?? true}
            scrollPercentage={manualData.scrollPercentage ?? 80}
          />
        )
      }
    } catch (error) {
      console.error('❌ FeatureCarousel server error:', error)
    }
  }

  // Fallback - empty state
  console.warn('⚠️ No valid data source, rendering empty')
  return (
    <FeatureCarouselClient
      dataSource="manual"
      heading="Discover Our Features"
      subheading="No data available"
      cards={[]}
      showNavigationButtons={manualData.showNavigationButtons ?? true}
      scrollPercentage={manualData.scrollPercentage ?? 80}
    />
  )
}

// Helper function to transform package data into feature cards
function transformPackageToCards(pkg: any, source: string): Array<{ title: string; description: string }> {
  switch (source) {
    case 'highlights':
      return (pkg.highlights || []).map((h: any) => ({
        title: h.text || '',
        description: h.text || '',
      }))
    
    case 'inclusions':
      return (pkg.inclusions || []).map((inc: any) => {
        const inclusion = typeof inc === 'object' ? inc : null
        return {
          title: inclusion?.name || inclusion?.title || 'Inclusion',
          description: inclusion?.description || inclusion?.summary || '',
        }
      })
    
    case 'activities':
      return (pkg.activities || []).map((act: any) => {
        const activity = typeof act === 'object' ? act : null
        return {
          title: activity?.name || activity?.title || 'Activity',
          description: activity?.description || activity?.summary || '',
        }
      })
    
    case 'amenities':
      return (pkg.amenities || []).map((am: any) => {
        const amenity = typeof am === 'object' ? am : null
        return {
          title: amenity?.name || amenity?.title || 'Amenity',
          description: amenity?.description || amenity?.summary || '',
        }
      })
    
    default:
      return []
  }
}

// Helper function to generate heading based on source
function getHeadingForSource(packageName: string, source: string): string {
  const headings: Record<string, string> = {
    highlights: `${packageName} Highlights`,
    inclusions: `What's Included in ${packageName}`,
    activities: `Activities in ${packageName}`,
    amenities: `Amenities & Features`,
  }
  return headings[source] || `${packageName} Features`
}

// Helper function to generate subheading based on source
function getSubheadingForSource(pkg: any, source: string): string {
  const subheadings: Record<string, string> = {
    highlights: pkg.tagline || 'Discover what makes this package special',
    inclusions: 'Everything you need for an amazing experience',
    activities: 'Exciting experiences waiting for you',
    amenities: 'Comfort and convenience throughout your journey',
  }
  return subheadings[source] || pkg.summary || ''
}

export default FeatureCarousel
