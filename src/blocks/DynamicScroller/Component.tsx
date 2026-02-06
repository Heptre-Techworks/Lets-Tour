// src/blocks/DynamicScroller/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DynamicScrollerClient } from './Component.client'
import type { DynamicScrollerBlock } from '@/payload-types'

export const DynamicScrollerBlockComponent = async (props: DynamicScrollerBlock) => {
  const { sections = [] } = props

  console.log('🔍 DynamicScroller received props:', Object.keys(props))
  console.log('📋 Sections count:', sections==null?0:sections.length)

  const sectionsArray = Array.isArray(sections) ? sections : []

  const processedSections = await Promise.all(
    sectionsArray.map(async (section: any, idx) => {
      const blockType = section.blockType || section.blockName
      
      console.log(`📦 Section ${idx}:`, {
        blockType,
        allKeys: Object.keys(section),
      })

      // ==================== PACKAGE SECTION ====================
      if (blockType === 'packageSection' || section.populatePackagesBy) {
        const populateBy = section.populatePackagesBy || 'manual'
        
        console.log('📦 Processing Package Section:', { populateBy })

        const sectionData: any = {
          type: 'package',
          title: section.title,
          subtitle: section.subtitle,
          theme: section.theme,
          headerTypography: section.headerTypography,
          cardTypography: section.cardTypography,
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
            href: '#',
          }))
          console.log('📝 Using manual items:', sectionData.items.length)
        } else {
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
          } 
          else if (populateBy === 'featuredDestinations') {
            const featuredDests = await payload.find({
              collection: 'destinations',
              where: { 
                isFeatured: { equals: true },
                isPublished: { equals: true }
              },
              limit: 100,
            })
            
            const destIds = featuredDests.docs.map(d => d.id)
            if (destIds.length > 0) {
              query.where.destinations = { in: destIds }
            }
          } 
          else if (populateBy === 'destinations') {
            const destArray = Array.isArray(section.destinations) ? section.destinations : []
            const destIds = destArray.map((dest: any) => 
              typeof dest === 'object' ? dest.id : dest
            ).filter(Boolean)
            
            if (destIds.length > 0) {
              console.log('🗺️ Fetching packages from destinations:', destIds)
              query.where.destinations = { in: destIds }
            }
          } 
          else if (populateBy === 'vibes') {
            const vibesArray = Array.isArray(section.vibes) ? section.vibes : []
            const vibeIds = vibesArray.map((vibe: any) => 
              typeof vibe === 'object' ? vibe.id : vibe
            ).filter(Boolean)
            
            if (vibeIds.length > 0) {
              console.log('🎭 Fetching packages from vibes:', vibeIds)
              query.where.vibe = { in: vibeIds }
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
                slug: pkg.slug,
                href: `/packages/${pkg.slug}`,
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

      // ==================== DESTINATION SECTION ====================
      if (blockType === 'destinationSection' || section.populateDestinationsBy) {
        const populateBy = section.populateDestinationsBy || 'featured'
        
        console.log('🗺️ Processing Destination Section:', { populateBy })

        const sectionData: any = {
          type: 'destination',
          title: section.title || 'Featured Destinations',
          subtitle: section.subtitle,
          theme: section.theme,
          headerTypography: section.headerTypography,
          cardTypography: section.cardTypography,
          navigation: section.showNavigation ? {} : undefined,
          items: [],
        }

        if (populateBy === 'manual') {
          sectionData.items = (section.manualItems || []).map((item: any) => ({
            blockType: 'destinationItem' as const,
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            tag: item.tag,
            tagColor: item.tagColor,
            href: '#',
          }))
          console.log('📝 Using manual destination items:', sectionData.items.length)
        } else {
          const payload = await getPayload({ config: configPromise })
          const limit = section.destinationLimit || 6

          console.log('🎯 Fetching destinations with:', { populateBy, limit })

          const query: any = {
            limit,
            depth: 2,
            where: { isPublished: { equals: true } },
            sort: '-popularityScore',
          }

          if (populateBy === 'featured') {
            query.where.isFeatured = { equals: true }
          } else if (populateBy === 'popular') {
            query.where.isPopular = { equals: true }
          } else if (populateBy === 'inSeason') {
            query.where.isInSeason = { equals: true }
          }

          try {
            const result = await payload.find({
              collection: 'destinations',
              ...query,
            })

            console.log('✅ Fetched destinations:', result.docs.length)

            const destinationItems = result.docs.map((dest: any) => {
              const currencySymbol = dest.currency === 'USD' ? '$' : dest.currency === 'EUR' ? '€' : '₹'
              const tag = dest.isInSeason ? 'In Season' : dest.isPopular ? 'Popular' : ''
              const tagColor = dest.isInSeason ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'

              return {
                blockType: 'destinationItem' as const,
                id: dest.id,
                title: dest.name,
                price: `${currencySymbol}${dest.startingPrice?.toLocaleString() || '0'}`,
                image: typeof dest.featuredImage === 'object' ? dest.featuredImage : null,
                tag,
                tagColor,
                slug: dest.slug,
                href: `/destinations/${dest.slug}`,
              }
            })

            sectionData.items = destinationItems
            console.log('🎨 Transformed destination items:', destinationItems.length)
          } catch (error) {
            console.error('❌ Error fetching destinations:', error)
          }
        }

        return sectionData
      }

      // ==================== VIBE SECTION ====================
      if (blockType === 'vibeSection' || section.vibes) {
        console.log('🎭 Processing Vibe Section')

        const payload = await getPayload({ config: configPromise })
        const vibes = Array.isArray(section.vibes) ? section.vibes : []
        const packagesPerVibe = section.packagesPerVibe || 4

        const sectionData: any = {
          type: 'vibe',
          title: section.title || 'Vibe Match',
          subtitle: section.subtitle || "Today's enemy is tomorrow's friend.*",
          theme: section.theme,
          headerTypography: section.headerTypography,
          cardTypography: section.cardTypography,
          navigation: section.showNavigation ? {} : undefined,
          vibes: [],
        }

        try {
          const vibeGroups = await Promise.all(
            vibes.map(async (vibeRel: any) => {
              const vibeId = typeof vibeRel === 'object' ? vibeRel.id : vibeRel
              
              const vibe = await payload.findByID({
                collection: 'vibes',
                id: vibeId,
                depth: 0,
              })

              const packages = await payload.find({
                collection: 'packages',
                where: {
                  vibe: { equals: vibeId },
                  isPublished: { equals: true },
                },
                limit: packagesPerVibe,
                depth: 2,
              })

              console.log(`🎭 Vibe "${vibe.name}": ${packages.docs.length} packages`)

              const vibeItems = packages.docs.map((pkg: any) => {
                const currencySymbol = pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : '₹'
                const tag = pkg.isInSeason ? 'In Season' : pkg.isPopular ? 'Popular' : ''
                const tagColor = pkg.isInSeason ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'

                return {
                  blockType: 'packageItem' as const,
                  id: pkg.id,
                  title: pkg.name,
                  price: `${currencySymbol}${(pkg.discountedPrice || pkg.price || 0).toLocaleString()}`,
                  image: typeof pkg.heroImage === 'object' ? pkg.heroImage : null,
                  tag,
                  tagColor,
                  slug: pkg.slug,
                  href: `/packages/${pkg.slug}`,
                }
              })

              return {
                vibeName: vibe.name,
                vibeSlug: vibe.slug,
                color: vibe.color || 'orange',
                items: vibeItems,
              }
            })
          )

          sectionData.vibes = vibeGroups
          console.log('✅ Processed vibes:', vibeGroups.map(v => v.vibeName))
        } catch (error) {
          console.error('❌ Error fetching vibes:', error)
        }

        return sectionData
      }

      // ==================== ITINERARY SECTION ====================
      if (blockType === 'itinerarySection' || section.itinerarySource) {
        console.log('📅 Processing Itinerary Section:', {
          source: section.itinerarySource,
          hasRelation: !!section.packageRelation,
        })

        const sectionData: any = {
          type: 'itinerary',
          title: section.title,
          subtitle: section.subtitle,
          theme: section.theme,
          headerTypography: section.headerTypography,
          cardTypography: section.cardTypography,
          navigation: section.showNavigation ? {} : undefined,
          items: [],
          // ✅ Pass these to client for auto-fetch
          itinerarySource: section.itinerarySource,
          packageRelation: section.packageRelation,
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
        else if (section.itinerarySource === 'package' && section.packageRelation) {
          // Specific package selected - fetch on server
          try {
            const payload = await getPayload({ config: configPromise })
            const packageId = typeof section.packageRelation === 'object' 
              ? section.packageRelation.id 
              : section.packageRelation
            
            console.log('🔍 Fetching itinerary for package ID:', packageId)
            
            const packageDoc = await payload.findByID({
              collection: 'packages',
              id: packageId,
              depth: 2,
            })

            if (packageDoc?.itinerary) {
              sectionData.items = (packageDoc.itinerary || []).map((day: any, idx: number) => ({
                blockType: 'itineraryDay' as const,
                id: day.id || `day-${idx}`,
                day: day.dayTitle || day.day || `Day ${idx + 1}`,
                activities: (day.activities || []).map((activity: any) => ({
                  icon: activity.icon,
                  description: activity.description || activity.text || '',
                  detailsImage: activity.image || activity.detailsImage,
                })),
              }))
              
              console.log(`✅ Loaded ${sectionData.items.length} days from selected package`)
            } else {
              console.warn('⚠️ Package has no itinerary data')
            }
          } catch (error) {
            console.error('❌ Error fetching package itinerary:', error)
          }
        }
        // ✅ Auto mode - client will fetch based on URL
        else if (section.itinerarySource === 'package') {
          console.log('⏳ Package auto mode - client will fetch based on URL')
          // Items will be empty, client will populate via useEffect
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
    itemCount: s.items?.length || s.vibes?.length || 0,
    itinerarySource: s.itinerarySource,
  })))

  return <DynamicScrollerClient sections={processedSections} />
}

export default DynamicScrollerBlockComponent
