import React from 'react'
import Link from 'next/link'

type Package = {
  id: string
  title: string
  slug: string
  destination: {
    name: string
    country: string
  }
  price: number
  originalPrice?: number
  currency: string
  priceUnit: string
  duration: {
    days: number
    nights: number
  }
  itinerary?: string
  tags?: string[]
  discount?: {
    hasDiscount: boolean
    percentage?: number
    label?: string
  }
  heroImage: {
    url: string
    alt?: string
  }
  rating?: number
  reviewCount?: number
}

type Props = {
  title?: string
  subtitle?: string
  packages?: Package[]
  layout?: 'grid-3' | 'grid-4' | 'carousel'
  showViewAll?: boolean
}

export const PackageGridBlock: React.FC<Props> = ({
  title = 'Popular Packages',
  subtitle,
  packages = [],
  layout = 'grid-3',
  showViewAll = true
}) => {
  const gridClass = layout === 'grid-4' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
        </div>
        
        <div className={layout === 'carousel' ? 'flex overflow-x-auto space-x-6 pb-4' : gridClass}>
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <Link href="/packages">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                View All Packages
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

const PackageCard: React.FC<{ package: Package }> = ({ package: pkg }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group min-w-[300px]">
      <div className="relative">
        <img 
          src={pkg.heroImage.url}
          alt={pkg.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {pkg.tags?.map((tag) => (
            <span 
              key={tag}
              className="bg-white bg-opacity-90 text-xs font-semibold px-2 py-1 rounded-full"
            >
              {tag === 'popular' && '♡ Popular'}
              {tag === 'in-season' && '♡ In Season'}
              {tag === 'family-friendly' && '♡ Family Friendly'}
            </span>
          ))}
        </div>

        {pkg.discount?.hasDiscount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {pkg.discount.label || `${pkg.discount.percentage}% Off`}
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-100">
          <span className="text-gray-600">♡</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold mb-2">{pkg.destination.name}</h3>
        {pkg.itinerary && (
          <p className="text-gray-600 text-sm mb-3">{pkg.itinerary}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              {pkg.originalPrice && (
                <span className="text-gray-400 line-through text-sm">
                  ₹{pkg.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xl font-bold text-green-600">
                ₹{pkg.price.toLocaleString()}
              </span>
            </div>
            <span className="text-gray-500 text-sm">({pkg.priceUnit})</span>
          </div>
          
          {pkg.rating && (
            <div className="text-right">
              <div className="flex items-center text-yellow-400">
                <span>⭐</span>
                <span className="ml-1 text-gray-600">{pkg.rating}</span>
              </div>
              {pkg.reviewCount && (
                <span className="text-xs text-gray-500">{pkg.reviewCount} reviews</span>
              )}
            </div>
          )}
        </div>

        <Link href={`/packages/${pkg.slug}`}>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Details →
          </button>
        </Link>
      </div>
    </div>
  )
}
