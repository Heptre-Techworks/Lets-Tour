'use client'

import React, { useState } from 'react'
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
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
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8 max-w-5xl mx-auto mt-24 sm:mt-32">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-md">
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>

        {/* Search Section */}
        {searchEnabled && (
          <div className="bg-white bg-opacity-95 rounded-lg p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Destination"
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchData.destination}
                onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
              />

              <input
                type="date"
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchData.date}
                onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
              />

              <input
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchData.people}
                onChange={(e) => setSearchData({ ...searchData, people: e.target.value })}
              />
              {/* <option value="">No of people</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3-5">3–5 People</option>
                <option value="6+">6+ People</option>
              </select> */}

              <input
                type="category"
                className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchData.category}
                onChange={(e) => setSearchData({ ...searchData, category: e.target.value })}
              />
              {/* <option value="">Category</option>
                <option value="popular">Popular</option>
                <option value="family">Family Friendly</option>
                <option value="adventure">Adventure</option>
                <option value="luxury">Luxury</option>
              </select> */}
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
              Apply
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
