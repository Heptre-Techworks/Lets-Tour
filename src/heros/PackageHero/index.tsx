'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

// --- SVG Icons ---
const StarIcon: React.FC = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" />
  </svg>
)

const DownloadIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
)

// --- Types ---
type VacationType = {
  type: string
  label: string
  icon: string
  percentage: number
  id?: string
}

type RecentBooking = {
  avatar: MediaType | string
  id?: string
}

type PackageHeroProps = {
  title: string
  rating: number
  location: string
  description: string
  vacationTypes: VacationType[]
  pricing: {
    originalPrice: string
    discountedPrice: string
    currency?: string
  }
  bookingCount: string
  recentBookings: RecentBooking[]
  mainImage: MediaType | string
  backgroundImage: MediaType | string
  buttons?: {
    bookNowLabel?: string
    enableDownload?: boolean
  }
}

// --- Main Component ---
export const PackageHero: React.FC<PackageHeroProps> = ({
  title,
  rating,
  location,
  description,
  vacationTypes,
  pricing,
  bookingCount,
  recentBookings,
  mainImage,
  backgroundImage,
  buttons = {},
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const { bookNowLabel = 'Book now', enableDownload = true } = buttons
  const currency = pricing.currency || '₹'

  return (
    <section
      className="relative -mt-[10.4rem] w-full min-h-screen bg-gray-900 flex items-center justify-center font-sans p-4"
      data-theme="dark"
    >
      <div className="relative w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-black/50">
        {/* Background Image */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 z-0">
          <Media resource={backgroundImage} imgClassName="object-cover w-full h-full" />
        </div>

        <div className="relative z-10 px-8 pb-8 pt-20 md:px-12 md:pb-12 md:pt-24 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Side: Image */}
            <div className="w-full h-full">
              <Media
                resource={mainImage}
                imgClassName="rounded-2xl w-full h-full object-cover shadow-lg"
              />
            </div>

            {/* Right Side: Details */}
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                {title}
              </h1>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(rating)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <span className="text-sm text-gray-300 tracking-wide">{location}</span>
              </div>

              <p className="text-gray-300 text-base leading-relaxed">{description}</p>

              {/* Vacation Types */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {vacationTypes.map((vType) => (
                  <div
                    key={vType.id || vType.type}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{vType.icon}</span>
                        <div>
                          <p className="font-semibold text-white">{vType.type}</p>
                          <p className="text-xs text-gray-300">{vType.label}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-white">{vType.percentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full"
                        style={{ width: `${vType.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="flex items-end gap-4 pt-4">
                <p className="text-xl text-red-400 line-through">
                  {currency}
                  {pricing.originalPrice}
                </p>
                <div className="bg-orange-400 text-black px-6 py-3 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {currency}
                    {pricing.discountedPrice}
                  </p>
                  <p className="text-sm font-medium">/person</p>
                </div>
              </div>

              {/* Booking Info & Actions */}
              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {recentBookings.slice(0, 4).map((booking, index) => (
                      <div
                        key={booking.id || index}
                        className="w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden"
                      >
                        <Media
                          resource={booking.avatar}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold">{bookingCount}</p>
                    <p className="text-xs text-gray-300">bookings in the past month</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {enableDownload && (
                    <button
                      className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      aria-label="Download package details"
                    >
                      <DownloadIcon />
                    </button>
                  )}
                  <button className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors">
                    {bookNowLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
