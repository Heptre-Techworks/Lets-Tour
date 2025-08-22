import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Destination, Package } from '../../../../payload-types'

export async function generateStaticParams() {
  const payload = await getPayloadHMR({ config: configPromise })
  
  const destinations = await payload.find({
    collection: 'destinations',
    limit: 1000,
  })

  return destinations.docs.map((destination: Destination) => ({
    slug: destination.slug,
  }))
}

export default async function DestinationPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const payload = await getPayloadHMR({ config: configPromise })
  
  const destinations = await payload.find({
    collection: 'destinations',
    where: {
      slug: {
        equals: params.slug,
      },
    },
    limit: 1,
  })

  if (!destinations.docs.length) {
    notFound()
  }

  const destination = destinations.docs[0] as Destination

  // Fetch packages for this destination
  const packages = await payload.find({
    collection: 'packages',
    where: {
      destination: {
        equals: destination.id,
      },
    },
    limit: 20,
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96">
        <img 
          src={typeof destination.heroImage === 'string' ? '' : destination.heroImage.url || ''}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{destination.name}</h1>
            <p className="text-xl">{destination.country}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="prose max-w-none mb-8">
              {/* Rich Text Content - Using Lexical format from types */}
              <div className="text-lg leading-relaxed">
                {destination.shortDescription && (
                  <p className="text-xl text-gray-600 mb-6">{destination.shortDescription}</p>
                )}
              </div>
            </div>

            {/* Gallery */}
            {destination.gallery && destination.gallery.length > 0 && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destination.gallery.map((item, index) => (
                    <div key={index} className="aspect-square">
                      <img 
                        src={typeof item.image === 'string' ? '' : item.image.url || ''}
                        alt={item.caption || destination.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Packages */}
            {packages.docs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6">Available Packages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.docs.map((pkg: Package) => (
                    <div key={pkg.id} className="bg-white p-6 rounded-lg shadow-lg">
                      <h3 className="text-xl font-semibold mb-2">{pkg.title}</h3>
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                        <a 
                          href={`/packages/${pkg.slug}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Quick Info</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Country:</span>
                  <span className="ml-2">{destination.country}</span>
                </div>
                <div>
                  <span className="font-semibold">Continent:</span>
                  <span className="ml-2 capitalize">{destination.continent}</span>
                </div>
                {destination.startingPrice && (
                  <div>
                    <span className="font-semibold">Starting Price:</span>
                    <span className="ml-2 text-green-600 font-bold">
                      ₹{destination.startingPrice.toLocaleString()}/person
                    </span>
                  </div>
                )}
                {destination.packageCount && (
                  <div>
                    <span className="font-semibold">Available Packages:</span>
                    <span className="ml-2">{destination.packageCount}</span>
                  </div>
                )}
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Plan Trip Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
