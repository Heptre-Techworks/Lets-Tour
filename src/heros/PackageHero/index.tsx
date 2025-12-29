// src/heroes/PackageHero/Component.tsx
'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Media as MediaType, Package, Review } from '@/payload-types'
import { Media } from '@/components/Media'
import Link from 'next/link'

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || 'w-5 h-5 text-yellow-400'} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" />
  </svg>
)

const DownloadIcon = () => (
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

type PackageHeroProps = {
  buttons?: {
    bookNowLabel?: string
    enableDownload?: boolean
  }
  package?: Package
  recentReviews?: Review[]
}

export const PackageHero: React.FC<PackageHeroProps> = ({
  buttons,
  package: packageProp,
  recentReviews: recentReviewsProp = [],
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  const [pkg, setPackage] = useState<Package | null>(packageProp || null)
  const [recentReviews, setRecentReviews] = useState<Review[]>(recentReviewsProp)
  const [loading, setLoading] = useState(!packageProp)

  useEffect(() => {
    if (packageProp) return
    const fetchPackage = async () => {
      const slug = pathname.split('/packages/')[1]?.split('/')[0]
      if (!slug) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/packages?where[slug][equals]=${slug}&depth=2`)
        const data = await response.json()
        if (data.docs && data.docs[0]) {
          setPackage(data.docs[0])
          const reviewsResponse = await fetch(
            `/api/reviews?where[package][equals]=${data.docs[0].id}&where[published][equals]=true&limit=10&depth=2`,
          )
          const reviewsData = await reviewsResponse.json()
          if (reviewsData.docs) setRecentReviews(reviewsData.docs)
        }
      } catch (error) {
        console.error('Error fetching package:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPackage()
  }, [pathname, packageProp])

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  if (loading) {
    return (
      <section
        className="relative -mt-[10.4rem] w-screen min-h-screen bg-gray-900 flex items-center justify-center text-white"
        data-theme="dark"
      >
        Loading package...
      </section>
    )
  }

  if (!pkg) {
    return (
      <section
        className="relative -mt-[10.4rem] w-screen min-h-screen bg-gray-900 flex items-center justify-center text-white"
        data-theme="dark"
      >
        Package not found
      </section>
    )
  }

  const bookNowLabel = buttons?.bookNowLabel || 'Book now'
  const enableDownload = buttons?.enableDownload !== false

  const title = pkg.name
  const rating = pkg.starRating || pkg.rating || 5
  const location = pkg.Summary || ''
  const description = typeof pkg.description === 'string' ? pkg.description : ''

  const vacationTypes = pkg.categories
    ? (Array.isArray(pkg.categories) ? pkg.categories : []).map((cat) => {
        const category = typeof cat === 'object' ? cat : null
        return {
          type: category?.name || '',
          label: `For ${category?.name} Vacations`,
          icon: '✈',
          percentage: 75,
        }
      })
    : []

  const pricing = {
    originalPrice: pkg.price?.toLocaleString() || '0',
    discountedPrice: pkg.discountedPrice?.toLocaleString() || pkg.price?.toLocaleString() || '0',
    currency:
      pkg.currency === 'INR'
        ? '₹'
        : pkg.currency === 'USD'
          ? '$'
          : pkg.currency === 'EUR'
            ? '€'
            : '£',
  }

  const bookingCount = pkg.bookingsCount30d || 0

  const recentBookings = recentReviews.slice(0, 4).map((review) => {
    const user = typeof review.user === 'object' ? review.user : null
    return {
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (user?.email || review.id),
      id: review.id,
    }
  })

  const mainImage = pkg.heroImage
  const backgroundImage = pkg.gallery?.[0] || pkg.heroImage

  return (
    <section
      className="relative -mt-[10.4rem] w-screen min-h-screen bg-gray-900 font-sans"
      data-theme="dark"
    >
      {/* Font classes (Amiri + NATS) */}
      <style jsx>{`
        .font-amiri {
          font-family: 'Amiri', serif;
        }
        .font-nats {
          font-family:
            'NATS',
            ui-sans-serif,
            system-ui,
            -apple-system,
            'Segoe UI',
            Roboto,
            'Helvetica Neue',
            Arial,
            'Noto Sans',
            'Apple Color Emoji',
            'Segoe UI Emoji',
            'Segoe UI Symbol',
            'Noto Color Emoji';
        }
      `}</style>

      {/* ✅ Background image - full screen */}
      <div className="absolute inset-0 w-full h-full opacity-30 z-0">
        <Media resource={backgroundImage} imgClassName="object-cover w-full h-full" />
      </div>

      {/* ✅ Content wrapper - full width with overlay */}
      <div className="relative w-full h-full flex items-center justify-center bg-black/50 py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full px-8 py-20 md:px-16 md:py-24 text-white max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <div className="w-full h-full">
              <Media
                resource={mainImage}
                imgClassName="rounded-2xl w-full h-full object-cover shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col space-y-2">
              {/* Title: Amiri italic, 56px, 88%, -0.011em */}
              <h1 className="font-amiri italic text-[56px] leading-[0.88] tracking-[-0.011em] text-white">
                {title}
              </h1>

              <div className=" flex-row items-center ">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 fill-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="mb-4">
                  {/* Meta line: NATS 20px 88% */}
                  <span className="font-nats text-[20px] leading-[0.88] tracking-[-0.011em] text-gray-200">
                    {location}
                  </span>
                </div>

                {/* Description: NATS 20px 100% */}
                <p className="font-nats text-[20px] leading-[1] tracking-[-0.011em] text-gray-200">
                  {description}
                </p>
              </div>

              {vacationTypes.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {vacationTypes.map((vType, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{vType.icon}</span>
                          <div>
                            {/* Card labels: NATS 20px 88% and 16px 88% */}
                            <p className="font-nats text-[20px] leading-[0.88] tracking-[-0.011em] text-white">
                              {vType.type}
                            </p>
                            <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-300">
                              {vType.label}
                            </p>
                          </div>
                        </div>
                        <span className="font-nats text-[20px] leading-[0.88] tracking-[-0.011em] text-white">
                          {vType.percentage}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full"
                          style={{ width: `${vType.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pricing and Actions */}

              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3 sm:gap-4 pt-4">
                {/* Original Price (Strikethrough) */}
                {pkg.discountedPrice && pkg.discountedPrice < pkg.price && (
                  <p className="font-nats text-[18px] xs:text-[22px] sm:text-[26px] md:text-[32px] text-red-500 line-through">
                    {pricing.currency}
                    {pricing.originalPrice}
                  </p>
                )}

                {/* Discounted Price */}
                <div className="flex items-center bg-orange-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg shadow-md">
                  <p className="font-nats text-[22px] xs:text-[26px] sm:text-[32px] md:text-[40px] leading-none">
                    {pricing.currency}
                    {pricing.discountedPrice}
                  </p>
                  <p className="ml-1 font-nats text-[12px] xs:text-[14px] sm:text-[16px] leading-none opacity-90">
                    /person
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center">
                  {recentBookings.length > 0 && (
                    <div className="flex -space-x-3">
                      {recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden bg-gray-700"
                        >
                          <img src={booking.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="ml-4">
                    {/* Booking count: NATS 20px 90% */}
                    <p className="font-nats text-[20px] leading-[0.9] tracking-[-0.011em] text-white">
                      {bookingCount}+
                    </p>
                    <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-300">
                      bookings in the past month
                    </p>
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
                  {/* Button label: NATS 24px line-height 0% style */}
                  <Link
                    href="/curate"
                    className="bg-white text-black py-3 px-8 rounded-full hover:bg-gray-200 transition-colors inline-block text-center"
                  >
                    <span className="font-nats text-[24px] leading-[0] tracking-[-0.011em] text-[#FBAE3D]">
                      {bookNowLabel}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PackageHero
