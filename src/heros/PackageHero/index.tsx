'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

type PackageHeroProps = {
  packageName: string
  packageImage: Media | string | null | undefined
  description?: string
}

export const PackageHero: React.FC<PackageHeroProps> = ({ packageName, packageImage, description }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  // Helper to check if packageImage is a valid media object with URL
  const isValidMedia = (img: any): img is Media => {
    return img && typeof img === 'object' && typeof img.url === 'string' && img.url.length > 0
  }

  return (
    <section
      className="relative -mt-[10.4rem] min-h-[50vh] p-8 flex flex-col items-center justify-center text-center text-white bg-blue-900"
      data-theme="dark"
    >
      <div className="container mb-8 z-10 relative">
        <h1 className="text-4xl font-bold mb-2">{packageName}</h1>
        {description && <p className="text-blue-200 max-w-xl mx-auto">{description}</p>}
      </div>
      <div className="min-h-[50vh] w-full select-none">
        {isValidMedia(packageImage) ? (
          <MediaComponent
            resource={packageImage}
            fill
            imgClassName="object-cover opacity-50 -z-10"
            priority
          />
        ) : (
          // Optional fallback: do not render image or render a placeholder
          null
        )}
      </div>
    </section>
  )
}
