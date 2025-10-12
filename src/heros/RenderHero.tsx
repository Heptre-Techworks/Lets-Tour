// src/heros/RenderHero.tsx
import React from 'react'
import { MainHero } from './MainHero'
import { DestinationHero } from './DestinationHero'
import { PackageHero } from './PackageHero'
import type { Page, Media } from '@/payload-types'

type RenderHeroProps = { hero: Page['hero'] | null | undefined }

type City = {
  name: string
  image: Media | string
  id?: string
}

type DestinationHeroFieldsShape = {
  destination?: string
  cities?: City[]
  autoplayInterval?: number
}

type VacationType = {
  type: string
  label: string
  icon: string
  percentage: number
  id?: string
}

type RecentBooking = {
  avatar: Media | string
  id?: string
}

type packageHeroFieldsShape = {
  title?: string
  rating?: number
  location?: string
  description?: string
  vacationTypes?: VacationType[]
  pricing?: {
    originalPrice?: string
    discountedPrice?: string
    currency?: string
  }
  bookingCount?: string
  recentBookings?: RecentBooking[]
  mainImage?: Media | string
  backgroundImage?: Media | string
  buttons?: {
    bookNowLabel?: string
    enableDownload?: boolean
  }
}

export const RenderHero: React.FC<RenderHeroProps> = ({ hero }) => {
  if (!hero) return null

  switch (hero.type) {
    case 'mainHero': {
      const slides =
        hero.mainHeroFields?.slides?.map(s => ({
          backgroundImage: s.backgroundImage,
          headline: s.headline || 'To travel is to live!',
          subtitle: s.subtitle || '10,348 ft',
          location: s.location || 'Mount Everest',
        })) ?? []

      return (
        <MainHero
          slides={slides}
          cloudImage={hero.mainHeroFields?.cloudImage ?? '/fallback-cloud.png'}
          enableAirplaneAnimation={hero.mainHeroFields?.enableAirplaneAnimation ?? true}
          autoplayDuration={hero.mainHeroFields?.autoplayDuration ?? 8000}
          transitionDuration={hero.mainHeroFields?.transitionDuration ?? 1000}
          destinationOptions={hero.mainHeroFields?.destinationOptions ?? [
            { label: 'Spain', value: 'spain' },
            { label: 'France', value: 'france' },
          ]}
          categoryOptions={hero.mainHeroFields?.categoryOptions ?? [
            { label: 'Adventure', value: 'adventure' },
            { label: 'Honeymoon', value: 'honeymoon' },
          ]}
          buttonLabel={hero.mainHeroFields?.buttonLabel ?? 'Apply'}
          placeholders={{
            destination: hero.mainHeroFields?.placeholders?.destination ?? 'Destination',
            date: hero.mainHeroFields?.placeholders?.date ?? 'Date',
            people: hero.mainHeroFields?.placeholders?.people ?? 'No of people',
            category: hero.mainHeroFields?.placeholders?.category ?? 'Category',
          }}
        />
      )
    }

    case 'destinationHero': {
      const dh = hero.destinationHeroFields as DestinationHeroFieldsShape | undefined
      if (!dh || !dh.cities || dh.cities.length === 0) return null

      return (
        <DestinationHero
          cities={dh.cities}
          autoplayInterval={dh.autoplayInterval ?? 5000}
        />
      )
    }

    case 'packageHero': {
      const tp = (hero as any).packageHeroFields as packageHeroFieldsShape | undefined
      if (!tp) return null

      return (
        <PackageHero
          title={tp.title ?? 'Spanish Escape'}
          rating={tp.rating ?? 5}
          location={tp.location ?? 'Madrid 2N, Seville 2N, Granada 1N, Barcelona 3N'}
          description={tp.description ?? ''}
          vacationTypes={tp.vacationTypes ?? [
            {
              type: 'Couples',
              label: 'For Newlywed Vacations',
              icon: '❤️',
              percentage: 75,
            },
            {
              type: 'Family',
              label: 'For Family Vacations',
              icon: '👨‍👩‍👧‍👦',
              percentage: 25,
            },
          ]}
          pricing={{
            originalPrice: tp.pricing?.originalPrice ?? '150,450',
            discountedPrice: tp.pricing?.discountedPrice ?? '117,927',
            currency: tp.pricing?.currency ?? '₹',
          }}
          bookingCount={tp.bookingCount ?? '250+'}
          recentBookings={tp.recentBookings ?? []}
          mainImage={tp.mainImage ?? ''}
          backgroundImage={tp.backgroundImage ?? ''}
          buttons={{
            bookNowLabel: tp.buttons?.bookNowLabel ?? 'Book now',
            enableDownload: tp.buttons?.enableDownload ?? true,
          }}
        />
      )
    }

    default:
      return null
  }
}
