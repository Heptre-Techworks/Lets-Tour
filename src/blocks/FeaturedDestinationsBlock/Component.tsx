import React from 'react'
import Link from 'next/link'

type Destination = {
  id: string
  name: string
  slug: string
  country: string
  continent: string
  heroImage: {
    url: string
    alt?: string
  }
  shortDescription?: string
  packageCount?: number
  startingPrice?: number
}

type Props = {
  title?: string
  subtitle?: string
  destinations?: Destination[]
}

export const FeaturedDestinationsBlock: React.FC<Props> = ({
  title = 'Featured Destinations',
  subtitle = "Today's enemy is tomorrow's friend.",
  destinations = []
}) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 italic">{subtitle}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link 
              key={destination.id}
              href={`/destinations/${destination.slug}`}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={destination.heroImage.url}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-white bg-opacity-90 text-xs font-semibold px-2 py-1 rounded-full">
                      ♡ In Season
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{destination.name}</h3>
                  {destination.startingPrice && (
                    <p className="text-gray-600 text-sm mb-2">
                      Packages starting at
                      <br />
                      <span className="text-lg font-bold text-green-600">
                        ₹{destination.startingPrice.toLocaleString()}/person
                      </span>
                    </p>
                  )}
                  {destination.packageCount && (
                    <p className="text-gray-500 text-xs">
                      {destination.packageCount} packages available
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
