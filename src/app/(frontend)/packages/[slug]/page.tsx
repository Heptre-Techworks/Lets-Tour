// app/packages/[slug]/page.tsx
import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Package, Destination } from '../../../../payload-types'

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config: configPromise })
  
  const packages = await payload.find({
    collection: 'packages',
    limit: 1000,
  })

  return packages.docs.map((pkg: Package) => ({
    slug: pkg.slug,
  }))
}

export default async function PackagePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const payload = await getPayloadHMR({ config: configPromise })
  
  const packages = await payload.find({
    collection: 'packages',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    limit: 1,
  })

  if (!packages.docs.length) {
    notFound()
  }

  const pkg = packages.docs[0] as Package
  const destination = typeof pkg.destination === 'string' ? null : pkg.destination as Destination

  // Fetch global settings
  const settings = await payload.findGlobal({
    slug: 'packageLayout',
  })

  // Fetch related packages from same destination
  const relatedPackages = await payload.find({
    collection: 'packages',
    where: {
      and: [
        {
          destination: {
            equals: typeof pkg.destination === 'string' ? pkg.destination : pkg.destination.id,
          },
        },
        {
          id: {
            not_equals: pkg.id,
          },
        },
      ],
    },
    limit: 4,
  })

  // Dynamic gallery grid classes
  const galleryGridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  const galleryGrid = galleryGridClasses[settings.galleryColumns as keyof typeof galleryGridClasses] || galleryGridClasses[3]

  return (
    <div>
      {/* Hero Section - Dynamic Height */}
      <section className={`relative ${settings.heroHeight}`}>
        <img 
          src={typeof pkg.heroImage === 'string' ? '' : pkg.heroImage.url || ''}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{pkg.title}</h1>
            {settings.showDestination && destination && (
              <p className="text-xl">
                {destination.name}, {destination.country}
              </p>
            )}
            {settings.showDuration && pkg.duration && (
              <p className="text-lg mt-2">
                {pkg.duration.days} Days, {pkg.duration.nights} Nights
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Package Details - Dynamic Title */}
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-6">{settings.packageDetailsTitle}</h2>
              {settings.showItinerary && pkg.itinerary && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">Itinerary</h3>
                  <p className="text-blue-700">{pkg.itinerary}</p>
                </div>
              )}
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">{pkg.description}</p>
              </div>
            </div>

            {/* Inclusions & Exclusions - Dynamic Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-green-800">
                    {settings.inclusionsTitle}
                  </h3>
                  <ul className="space-y-2">
                    {pkg.inclusions.map((item, index) => (
                      <li key={index} className="flex items-center text-green-700">
                        <span className="mr-2">✓</span>
                        {item.item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pkg.exclusions && pkg.exclusions.length > 0 && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-red-800">
                    {settings.exclusionsTitle}
                  </h3>
                  <ul className="space-y-2">
                    {pkg.exclusions.map((item, index) => (
                      <li key={index} className="flex items-center text-red-700">
                        <span className="mr-2">✗</span>
                        {item.item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Gallery - Dynamic Title and Columns */}
            {pkg.gallery && pkg.gallery.length > 0 && (
              <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                <h3 className="text-2xl font-bold mb-6">{settings.galleryTitle}</h3>
                <div className={`grid ${galleryGrid} gap-4`}>
                  {pkg.gallery.map((item, index) => (
                    <div key={index} className="aspect-square">
                      <img 
                        src={typeof item.image === 'string' ? '' : item.image.url || ''}
                        alt={item.caption || pkg.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Packages - Dynamic Title */}
            {relatedPackages.docs.length > 0 && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6">
                  {settings.relatedPackagesTitle} in {destination?.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPackages.docs.map((relatedPkg: Package) => (
                    <div key={relatedPkg.id} className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">{relatedPkg.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{relatedPkg.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          ₹{relatedPkg.price.toLocaleString()}
                        </span>
                        <a 
                          href={`/packages/${relatedPkg.slug}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Existing Sidebar - Dynamic Button Text */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-lg shadow-lg sticky top-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {pkg.originalPrice && (
                    <span className="text-gray-400 line-through text-xl">
                      ₹{pkg.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-green-600">
                    ₹{pkg.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600">({pkg.priceUnit})</p>
                {pkg.discount?.hasDiscount && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-block mt-2">
                    {pkg.discount.label}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {pkg.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{pkg.duration.days} days, {pkg.duration.nights} nights</span>
                  </div>
                )}
                {pkg.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1">{pkg.rating}</span>
                      {pkg.reviewCount && (
                        <span className="text-gray-500 text-sm ml-1">({pkg.reviewCount})</span>
                      )}
                    </div>
                  </div>
                )}
                {pkg.tags && pkg.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pkg.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Button Text */}
              <button className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
                {settings.bookButtonText}
              </button>
              
              <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                {settings.wishlistButtonText}
              </button>

              <div className="mt-6 pt-6 border-t">
                <a 
                  href={`/destinations/${destination?.slug}`}
                  className="text-blue-600 hover:underline block text-center"
                >
                  View More About {destination?.name} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
