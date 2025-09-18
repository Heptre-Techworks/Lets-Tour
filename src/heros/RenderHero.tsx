// src/heros/RenderHero.tsx
import React from 'react'
import { MainHero } from './MainHero'
import { DestinationHero } from './DestinationHero'
import { PackageHero } from './PackageHero'
import type { Page, Media } from '@/payload-types'

type RenderHeroProps = { hero: Page['hero'] | null | undefined }

type DestinationFieldsShape = {
  destination?: string | {
    id: string
    name: string
    slug: string
    heroImage: Media | string
    places?: { name: string; slug: string }[]
  }
  presentation?: {
    overlay?: number
    showArrows?: boolean
    titleOverride?: string
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
      // Read from the correct group and help TS with a local shape
      const dh = hero.destinationHeroFields as DestinationFieldsShape | undefined
      if (!dh) return null

      const rel = dh.destination
      const dest = typeof rel === 'object' ? rel : undefined
      if (!dest) return null

      return (
        <DestinationHero
          heroImage={dest.heroImage}
          title={dh.presentation?.titleOverride || dest.name}
          places={dest.places ?? []}
          overlay={dh.presentation?.overlay ?? 0.35}
          showArrows={dh.presentation?.showArrows ?? true}
        />
      )
    }

    case 'packageHero':
      return (
        <PackageHero
          packageName={hero.packageHeroFields?.packageName ?? 'Default Package'}
          description={hero.packageHeroFields?.description ?? ''}
          packageImage={hero.packageHeroFields?.packageImage ?? '/fallback.jpg'}
        />
      )

    default:
      return null
  }
}
