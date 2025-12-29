'use client'

import * as React from 'react'
import { cn } from '@/utilities/ui'
import Image from 'next/image'

type MaybeImage = { url?: string | null; alt?: string | null } | string | null | undefined

const getSrc = (img: MaybeImage): string | undefined =>
  typeof img === 'string' ? img : (img?.url ?? undefined)

const getAlt = (img: MaybeImage, fallback?: string | null): string => {
  const candidate = typeof img === 'string' ? fallback : (img?.alt ?? fallback)
  return candidate ?? ''
}

const HoverImage: React.FC<{
  src?: string
  alt?: string
  className?: string
  overlay?: boolean
  children?: React.ReactNode
}> = ({ src, alt = '', className, overlay = true, children }) => {
  const [transform, setTransform] = React.useState('translate(0px, 0px) scale(1)')

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / 20
    const y = (e.clientY - rect.top - rect.height / 2) / 20
    setTransform(`translate(${x}px, ${y}px) scale(1.05)`)
  }

  function handleMouseLeave() {
    setTransform('translate(0px, 0px) scale(1)')
  }

  return (
    <div
      className={cn('relative overflow-hidden group rounded-lg', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{ transform }}
          fill
        />
      )}
      {overlay && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
      {children}
    </div>
  )
}

export const ImageGridClient: React.FC<any> = ({
  leftHero,
  explore,
  spots,
  activities,
  labels,
  theme,
  className,
}) => {
  const wrap = !!theme?.container
  const dark = !!theme?.dark

  const leftHeroSrc = getSrc((leftHero?.image as any) ?? leftHero?.imageUrl)
  const leftHeroAlt = getAlt(
    (leftHero?.image as any) ?? leftHero?.imageUrl,
    leftHero?.alt ?? leftHero?.title ?? '',
  )

  const activitiesSrc = getSrc((activities?.image as any) ?? activities?.imageUrl)
  const activitiesAlt = getAlt(
    (activities?.image as any) ?? activities?.imageUrl,
    activities?.alt ?? activities?.title ?? '',
  )

  const spotsSafe = spots ?? []

  return (
    <section
      className={cn(
        dark ? 'text-white bg-[#111111]' : 'text-black',
        wrap ? 'container mx-auto' : 'w-full',
        'pb-0',
        className,
      )}
    >
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* LEFT HERO IMAGE */}
        <HoverImage
          src={leftHeroSrc}
          alt={leftHeroAlt}
          className="col-span-1 lg:col-span-2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4 sm:p-6 z-10 text-white">
            {leftHero?.title && (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{leftHero.title}</h2>
            )}
            {typeof leftHero?.rating === 'number' && (
              <p className="text-sm sm:text-md text-gray-300">
                {labels?.ratingPrefix ?? ''} {leftHero.rating.toFixed(1)}
              </p>
            )}
            {leftHero?.trail && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1">{leftHero.trail}</p>
            )}
          </div>
        </HoverImage>

        {/* RIGHT GRID */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Explore Card */}
          {(explore?.title || explore?.description) && (
            <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 bg-[#1a1a1a] text-white rounded-lg min-h-[250px] sm:min-h-[300px]">
              {explore?.subtitle && (
                <p className="text-xs sm:text-sm tracking-widest text-gray-400">
                  {explore.subtitle}
                </p>
              )}
              {explore?.title && (
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">{explore.title}</h3>
              )}
              {explore?.description && (
                <p className="text-gray-300 mt-3 text-sm sm:text-base">{explore.description}</p>
              )}
              {explore?.button?.label && (
                <a
                  href={explore?.button?.href || '#'}
                  className="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors self-start"
                >
                  {explore.button.label}
                </a>
              )}
            </div>
          )}

          {/* Image Spots */}
          {[1, 0, 2].map((i) =>
            spotsSafe[i] ? (
              <HoverImage
                key={i}
                src={getSrc((spotsSafe[i].image as any) ?? spotsSafe[i].imageUrl)}
                alt={getAlt(
                  (spotsSafe[i].image as any) ?? spotsSafe[i].imageUrl,
                  spotsSafe[i].alt ?? spotsSafe[i].name ?? '',
                )}
                className="min-h-[250px] sm:min-h-[300px]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-4 text-white z-10">
                  {spotsSafe[i].name && (
                    <h4 className="text-base sm:text-lg font-bold">{spotsSafe[i].name}</h4>
                  )}
                  {typeof spotsSafe[i].rating === 'number' && (
                    <p className="text-xs sm:text-sm text-gray-300">
                      {labels?.ratingPrefix ?? ''} {spotsSafe[i].rating.toFixed(1)}
                    </p>
                  )}
                  {spotsSafe[i].location && (
                    <p className="text-[10px] sm:text-xs text-gray-400">{spotsSafe[i].location}</p>
                  )}
                </div>
              </HoverImage>
            ) : null,
          )}
        </div>
      </main>

      {/* BOTTOM BANNER */}
      {(activitiesSrc || activities?.title) && (
        <HoverImage
          src={activitiesSrc}
          alt={activitiesAlt}
          className="relative h-[400px] sm:h-[500px] md:h-[600px] mt-6 sm:mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
          <div className="relative z-10 p-6 sm:p-8 md:p-12 max-w-lg text-white">
            {activities?.subtitle && (
              <p className="text-xs sm:text-sm tracking-widest text-gray-300">
                {activities.subtitle}
              </p>
            )}
            {activities?.title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3">
                {activities.title}
              </h2>
            )}
            {activities?.description && (
              <p className="text-gray-200 mt-3 text-sm sm:text-base">{activities.description}</p>
            )}
            {activities?.button?.label && (
              <a
                href={activities?.button?.href || '#'}
                className="mt-6 inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {activities.button.label}
              </a>
            )}
          </div>
        </HoverImage>
      )}
    </section>
  )
}

export default ImageGridClient
