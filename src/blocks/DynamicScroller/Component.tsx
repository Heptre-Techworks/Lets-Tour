// src/blocks/DynamicScroller/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DynamicScrollerClient } from './Component.client'
import type { DynamicScrollerBlock } from '@/payload-types'

export const DynamicScrollerBlockComponent = async (props: DynamicScrollerBlock) => {
  const { sections = [] } = props
  
  // ✅ FIX: Payload doesn't populate blocks inside blocks by default
  // The sections array comes through but blockType isn't there
  // We need to treat it as raw data
  const sectionsArray = Array.isArray(sections) ? sections : []

  console.log('🔍 DynamicScroller received props:', Object.keys(props))
  console.log('📋 RAW SECTION DATA:', JSON.stringify(sectionsArray, null, 2))

  const processedSections = await Promise.all(
    sectionsArray.map(async (section: any, idx) => {
      // ✅ The blockType is there in DB but may not be in the type
      const blockType = section.blockType || section.blockName
      
      console.log(`📦 Section ${idx}:`, {
        blockType,
        populateBy: section.populatePackagesBy,
        allKeys: Object.keys(section),
      })

      // ✅ Handle Package Section - check multiple possible identifiers
      if (blockType === 'packageSection' || section.populatePackagesBy) {
        const populateBy = section.populatePackagesBy || 'manual'
        
        console.log('📦 Processing Package Section:', { populateBy })

        const sectionData: any = {
          type: 'package',
          title: section.title,
          subtitle: section.subtitle,
          theme: section.theme,
          navigation: section.showNavigation ? {} : undefined,
          items: [],
        }

        if (populateBy === 'manual') {
          sectionData.items = (section.manualItems || []).map((item: any) => ({
            blockType: 'packageItem' as const,
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            tag: item.tag,
            tagColor: item.tagColor,
          }))
          console.log('📝 Using manual items:', sectionData.items.length)
        } else {
          // Fetch from collection
          const payload = await getPayload({ config: configPromise })
          const limit = section.packageLimit || 6

          console.log('🎯 Fetching packages with:', { populateBy, limit })

          const query: any = {
            limit,
            depth: 2,
            where: { isPublished: { equals: true } },
            sort: '-createdAt',
          }

          if (populateBy === 'featured') {
            query.where.isFeatured = { equals: true }
          } else if (populateBy === 'destination') {
            const destId = typeof section.destination === 'object' 
              ? section.destination?.id 
              : section.destination
            if (destId) {
              query.where.destinations = { contains: destId }
            }
          }

          try {
            const result = await payload.find({
              collection: 'packages',
              ...query,
            })

            console.log('✅ Fetched packages:', result.docs.length)

            const packageItems = result.docs.map((pkg: any) => {
              const firstLabel = Array.isArray(pkg.labels) && pkg.labels[0]
              const labelObj = typeof firstLabel === 'object' ? firstLabel : null

              return {
                blockType: 'packageItem' as const,
                id: pkg.id,
                title: pkg.name,
                price: pkg.price?.toString() || '0',
                image: typeof pkg.heroImage === 'object' ? pkg.heroImage : null,
                tag: labelObj?.name || '',
                tagColor: labelObj?.color || 'bg-orange-400 text-white',
              }
            })

            sectionData.items = packageItems
            console.log('🎨 Transformed items:', packageItems.length)
          } catch (error) {
            console.error('❌ Error fetching packages:', error)
          }
        }

        return sectionData
      }

      // ✅ Handle Itinerary Section
      if (blockType === 'itinerarySection' || section.itinerarySource) {
        console.log('📅 Processing Itinerary Section')

        const sectionData: any = {
          type: 'itinerary',
          title: section.title,
          subtitle: section.subtitle,
          theme: section.theme,
          navigation: section.showNavigation ? {} : undefined,
          items: [],
        }

        if (section.itinerarySource === 'manual') {
          sectionData.items = (section.manualDays || []).map((day: any) => ({
            blockType: 'itineraryDay' as const,
            id: day.id,
            day: day.day,
            activities: day.activities || [],
          }))
          console.log('📝 Using manual itinerary days:', sectionData.items.length)
        }

        return sectionData
      }

      console.warn('⚠️ Unknown section type, keys:', Object.keys(section))
      return {
        type: undefined,
        items: [],
      }
    })
  )

  console.log('🎬 Final processed sections:', processedSections.map(s => ({ 
    type: s.type, 
    itemCount: s.items?.length || 0 
  })))

  return <DynamicScrollerClient sections={processedSections} />
}

export default DynamicScrollerBlockComponent
