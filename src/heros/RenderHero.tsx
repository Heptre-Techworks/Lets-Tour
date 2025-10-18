// src/heros/RenderHero.tsx
import React from 'react'
import { MainHero } from './MainHero'
import { DestinationHero } from './DestinationHero'
import { PackageHero } from './PackageHero'
import type { Page, Destination, Package, Review } from '@/payload-types'


type RenderHeroProps = { 
  hero: Page['hero'] | null | undefined
  // Optional: Pass fetched data for server-side rendering (to avoid double fetch)
  destinationData?: Destination
  packageData?: Package
  reviewsData?: Review[]
}


export const RenderHero: React.FC<RenderHeroProps> = ({ 
  hero, 
  destinationData,
  packageData,
  reviewsData = []
}) => {
  // ✅ Return black background div if no hero or type is 'none'
  if (!hero || hero.type === 'none') {
    return (
      <div 
        className="w-full bg-black -mt-[10.4rem] pt-[10.4rem]" 
        style={{ minHeight: '25vh' }}
        aria-hidden="true" 
      />
    )
  }


  switch (hero.type) {
    case 'mainHero': {
      const slides =
        hero.mainHeroFields?.slides?.map(s => ({
          backgroundImage: s.backgroundImage,
          headline: s.headline || 'To travel is to live!',
          subtitle: s.subtitle || '10,348 ft',
          location: s.location || 'Mount Everest',
        })) ?? []


      // Transform destinations for search form
      const destinationOptions = hero.mainHeroFields?.destinationOptions
        ? (Array.isArray(hero.mainHeroFields.destinationOptions) 
            ? hero.mainHeroFields.destinationOptions 
            : []
          ).map((dest) => {
            const destination = typeof dest === 'object' ? dest : null
            return {
              label: destination?.name || '',
              value: destination?.slug || '',
            }
          })
        : []


      // Transform categories for search form
      const categoryOptions = hero.mainHeroFields?.categoryOptions
        ? (Array.isArray(hero.mainHeroFields.categoryOptions)
            ? hero.mainHeroFields.categoryOptions
            : []
          ).map((cat) => {
            const category = typeof cat === 'object' ? cat : null
            return {
              label: category?.name || '',
              value: category?.slug || category?.name?.toLowerCase().replace(/\s+/g, '-') || '',
            }
          })
        : []


      return (
        <MainHero
          slides={slides}
          cloudImage={hero.mainHeroFields?.cloudImage ?? '/fallback-cloud.png'}
          enableAirplaneAnimation={hero.mainHeroFields?.enableAirplaneAnimation ?? true}
          autoplayDuration={hero.mainHeroFields?.autoplayDuration ?? 8000}
          transitionDuration={hero.mainHeroFields?.transitionDuration ?? 1000}
          destinationOptions={destinationOptions}
          categoryOptions={categoryOptions}
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
      return (
        <DestinationHero
          destination={destinationData}
          autoplayInterval={hero.destinationHeroFields?.autoplayInterval ?? 5000}
        />
      )
    }


    case 'packageHero': {
      return (
        <PackageHero
          package={packageData}
          buttons={{
            bookNowLabel: hero.packageHeroFields?.buttons?.bookNowLabel ?? 'Book now',
            enableDownload: hero.packageHeroFields?.buttons?.enableDownload ?? true,
          }}
          recentReviews={reviewsData}
        />
      )
    }


    default:
      return null
  }
}
