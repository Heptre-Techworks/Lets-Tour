// src/blocks/DestinationHeroCarousel/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DestinationHeroCarouselClient } from './Component.client'
import type { Destination } from '@/payload-types'

interface DestinationHeroCarouselProps {
  title?: string
  populateBy?: 'auto' | 'destination' | 'manual'
  destination?: Destination | string
  limit?: number
  stops?: any[]
  timingSettings?: {
    autoplayDelay?: number
    transitionDuration?: number
  }
}

export const DestinationHeroCarousel = async ({
  title = 'Things to do in {slug}',
  populateBy = 'auto',
  destination: destinationProp,
  limit = 8,
  stops: manualStops = [],
  timingSettings = {},
}: DestinationHeroCarouselProps) => {
  // ✅ FIXED: Use any[] for Payload result types
  let places: any[] = []

  if (populateBy !== 'manual') {
    const payload = await getPayload({ config: configPromise })
    
    const query: any = {
      limit,
      depth: 2,
      where: { isPublished: { equals: true } },
      sort: 'displayOrder',
    }

    if (populateBy === 'destination' && destinationProp) {
      const destId = typeof destinationProp === 'object' ? destinationProp.id : destinationProp
      if (destId && /^[0-9a-fA-F]{24}$/.test(destId)) {
        query.where.destination = { equals: destId }
      }
    }

    try {
      const result = await payload.find({
        collection: 'places',
        ...query,
      })
      places = result.docs
    } catch (error) {
      console.error('Error fetching places:', error)
    }
  }

  const stops = populateBy === 'manual' 
    ? manualStops 
    : places.map((place) => ({
        id: place.id,
        name: place.name,
        city: typeof place.city === 'object' ? place.city?.name : '',
        image: typeof place.image === 'object' ? place.image?.url : place.image,
        excerpt: place.shortDescription || '',
        slug: place.slug,
      }))

  return (
    <DestinationHeroCarouselClient
      title={title}
      stops={stops}
      timingSettings={timingSettings}
    />
  )
}

export default DestinationHeroCarousel
