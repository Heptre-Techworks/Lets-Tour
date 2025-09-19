import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  backgroundImage?: {
    url: string
    alt?: string
  }
  title?: string
  subtitle?: string
  searchEnabled?: boolean
}

export const HeroSearchBlock: React.FC<Props> = ({
  backgroundImage,
  title = 'To travel is to live!',
  subtitle = '10,348 ft Mount Everest',
  searchEnabled = true,
}) => {
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
    people: '',
    category: '',
  })

  return (
    <section className="relative h-screen flex items-center justify-center">
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.alt || title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
      )}

      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">LETS TOUR</div>
          <div className="hidden md:flex space-x-8 text-white">
            <Link href="/destinations" className="hover:text-blue-300">
              Destinations
            </Link>
            <Link href="/packages" className="hover:text-blue-300">
              Packages
            </Link>
            <Link href="/bulk-bookings" className="hover:text-blue-300">
              Bulk bookings
            </Link>
            <Link href="/curate" className="hover:text-blue-300">
              Curate
            </Link>
          </div>
          <div className="text-white">
            <span className="mr-4">📞</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8">{subtitle}</p>

        {searchEnabled && (
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Destination"
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchData.destination}
                  onChange={(e) =>
                    setSearchData({ ...searchData, destination: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="date"
                  placeholder="Date"
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchData.date}
                  onChange={(e) =>
                    setSearchData({ ...searchData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <select
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchData.people}
                  onChange={(e) =>
                    setSearchData({ ...searchData, people: e.target.value })
                  }
                >
                  <option value="">No of people</option>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3-5">3-5 People</option>
                  <option value="6+">6+ People</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchData.category}
                  onChange={(e) =>
                    setSearchData({ ...searchData, category: e.target.value })
                  }
                >
                  <option value="">Category</option>
                  <option value="popular">Popular</option>
                  <option value="family">Family Friendly</option>
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Apply
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
