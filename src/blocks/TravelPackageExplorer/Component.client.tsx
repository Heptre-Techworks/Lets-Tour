'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link' // ✅ ADD

type MediaLike = { url?: string | null; alt?: string | null }

// Local font classes (no external imports here)
const FontClasses = () => (
  <style jsx global>{`
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
)

// Helper to get image source
const getImageSrc = (pkg: any) => {
  if (pkg?.image && typeof pkg.image === 'object' && 'url' in pkg.image && pkg.image?.url) {
    return pkg.image.url as string
  }
  if (pkg?.imageUrl) return pkg.imageUrl
  return 'https://placehold.co/600x400/cccccc/FFFFFF/png?text=No+Image'
}

// --- HELPER COMPONENTS ---

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  )
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="py-3 border-b border-gray-700">
    <h3 className="font-nats tracking-[-0.011em] leading-[0.88] text-white text-base">{title}</h3>
    <div className="mt-2 space-y-1">{children}</div>
  </div>
)

const Checkbox: React.FC<{
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}> = ({ label, count, checked, onChange }) => (
  <label className="flex items-center justify-between text-gray-300 text-sm cursor-pointer hover:text-white">
    <span className="flex items-center">
      <input
        type="checkbox"
        className="h-3 w-3 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-600"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-2 font-nats text-[16px] leading-[0.88] tracking-[-0.011em]">{label}</span>
    </span>
    {count !== undefined && (
      <span className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em]">{count}</span>
    )}
  </label>
)

// --- MAIN COMPONENTS ---

const Filters: React.FC<{
  filters: any
  setFilters: React.Dispatch<React.SetStateAction<any>>
  packages: any[]
}> = ({ filters, setFilters, packages }) => {
  const handlePriceChange = (rangeValue: string) => {
    setFilters((prev: any) => {
      const currentRanges = prev.priceRanges || []
      const newRanges = currentRanges.includes(rangeValue)
        ? currentRanges.filter((r: string) => r !== rangeValue)
        : [...currentRanges, rangeValue]
      return { ...prev, priceRanges: newRanges }
    })
  }

  const handleRatingChange = (rating: number) => {
    setFilters((prev: any) => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))
  }

  const handleCheckboxChange = (category: string, value: string) => {
    setFilters((prev: any) => {
      const currentValues = prev[category] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item: string) => item !== value)
        : [...currentValues, value]
      return { ...prev, [category]: newValues }
    })
  }

  const isPriceRangeChecked = (rangeValue: string) => {
    return (filters.priceRanges || []).includes(rangeValue)
  }

  const experiences = [...new Set(packages.flatMap((p) => p.experiences || []))]
  const accommodationTypes = [...new Set(packages.map((p) => p.accommodationType).filter(Boolean))]
  const amenities = [...new Set(packages.flatMap((p) => p.amenities || []))]
  const provinces = [...new Set(packages.map((p) => p.province).filter(Boolean))]

  return (
    <div className="w-full bg-[#1e293b] text-white p-4 rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="font-nats text-[20px] leading-[0.88] tracking-[-0.011em] mb-3">Filters</h2>

      <FilterSection title="Budget">
        {['0-90000', '90001-120000', '120001-150000', '150001-200000'].map((range) => {
          const [min, max] = range.split('-')
          return (
            <label
              key={range}
              className="flex items-center text-gray-300 text-sm cursor-pointer hover:text-white"
            >
              <input
                type="checkbox"
                value={range}
                checked={isPriceRangeChecked(range)}
                onChange={() => handlePriceChange(range)}
                className="h-3 w-3 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-600"
              />
              <span className="ml-2 font-nats text-[16px] leading-[0.88] tracking-[-0.011em]">
                ₹{Number(min).toLocaleString()} - ₹{Number(max).toLocaleString()}
              </span>
            </label>
          )
        })}
      </FilterSection>

      <FilterSection title="Rating">
        <div className="flex space-x-1">
          {[5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => handleRatingChange(r)}
              className={`px-2 py-0.5 border rounded-md text-xs font-nats tracking-[-0.011em] leading-[0.88] ${
                filters.rating === r
                  ? 'bg-yellow-500 border-yellow-500 text-black'
                  : 'border-gray-500 text-gray-300'
              }`}
            >
              {r} ★
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Duration">
        <Checkbox
          label="1-3 Days"
          checked={(filters.duration || []).includes('1-3')}
          onChange={() => handleCheckboxChange('duration', '1-3')}
        />
        <Checkbox
          label="4-6 Days"
          checked={(filters.duration || []).includes('4-6')}
          onChange={() => handleCheckboxChange('duration', '4-6')}
        />
        <Checkbox
          label="7-9 Days"
          checked={(filters.duration || []).includes('7-9')}
          onChange={() => handleCheckboxChange('duration', '7-9')}
        />
      </FilterSection>

      {experiences.length > 0 && (
        <FilterSection title="Experiences">
          {experiences.map((exp) => (
            <Checkbox
              key={exp}
              label={exp}
              checked={(filters.experiences || []).includes(exp)}
              onChange={() => handleCheckboxChange('experiences', exp)}
            />
          ))}
        </FilterSection>
      )}

      {accommodationTypes.length > 0 && (
        <FilterSection title="Accommodation Type">
          {accommodationTypes.map((type) => (
            <Checkbox
              key={type}
              label={type}
              checked={(filters.accommodationType || []).includes(type)}
              onChange={() => handleCheckboxChange('accommodationType', type)}
            />
          ))}
        </FilterSection>
      )}

      {amenities.length > 0 && (
        <FilterSection title="Amenities">
          {amenities.map((amenity) => (
            <Checkbox
              key={amenity}
              label={amenity}
              checked={(filters.amenities || []).includes(amenity)}
              onChange={() => handleCheckboxChange('amenities', amenity)}
            />
          ))}
        </FilterSection>
      )}

      {provinces.length > 0 && (
        <FilterSection title="Provinces">
          {provinces.map((province) => (
            <Checkbox
              key={province}
              label={province}
              checked={(filters.provinces || []).includes(province)}
              onChange={() => handleCheckboxChange('provinces', province)}
            />
          ))}
        </FilterSection>
      )}
    </div>
  )
}

// ✅ UPDATED: Wrap entire card with Link
const PackageCard: React.FC<{ pkg: any }> = ({ pkg }) => {
  const SuitabilityBar: React.FC<{
    label: string
    sublabel: string
    percentage: number
    icon: React.ReactNode
  }> = ({ label, sublabel, percentage, icon }) => (
    <div className="mb-2">
      <div className="flex items-center">
        {icon}
        <div className="ml-2">
          <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-800">
            {label}
          </p>
          <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-500">
            {sublabel}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
        <div className="bg-yellow-400 h-1 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )

  const imageSrc = getImageSrc(pkg)
  const href = pkg.href || `/packages/${pkg.slug}` || '#' // ✅ ADD

  return (
    <Link
      href={href}
      className="block group" // ✅ WRAP WITH LINK
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row mb-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 font-sans">
        {/* Image container with "card-in-card" effect */}
        <div className="md:w-64 p-3 flex-shrink-0">
          <img
            className="h-[48vh] w-full object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105" // ✅ ADD HOVER EFFECT
            src={imageSrc}
            alt={pkg.title}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = 'https://placehold.co/600x400/cccccc/FFFFFF/png?text=Error'
            }}
          />
        </div>

        <div className="p-4 pt-1 md:pt-4 md:pl-0 flex flex-col flex-grow w-full">
          <div className="flex flex-col sm:flex-row">
            {/* Main Info */}
            <div className="flex-grow pr-4">
              <div className="flex items-center space-x-2">
                {/* Title: Amiri italic 40px, 88% line-height, -0.011em */}
                <h3 className="font-amiri italic text-[40px] leading-[0.88] tracking-[-0.011em] text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {pkg.title}
                </h3>
                <StarRating rating={pkg.rating} />
              </div>
              {/* Location: NATS 16px, 88%, -0.011em */}
              <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-600 mt-2">
                {pkg.location}
              </p>
              {/* Description: NATS 16px, 88%, -0.011em */}
              <p
                className="
    font-nats text-[14px] xs:text-[15px] sm:text-[16px] md:text-[17px]
    leading-relaxed sm:leading-[1.6] tracking-[-0.011em]
    text-gray-700 text-justify sm:text-left
    mt-3 sm:mt-4 mb-2 sm:mb-3
    px-1 sm:px-0
  "
              >
                {pkg.description}
              </p>

              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-800">
                    Inclusions:
                  </h4>
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                    {pkg.inclusions.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="list-disc list-inside font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-600 p-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Side Info */}
            <div className="w-full sm:w-48 mt-4 sm:mt-0 flex-shrink-0">
              <div className="text-right">
                {pkg.originalPrice > pkg.price && (
                  <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-red-500 line-through">
                    ₹{pkg.originalPrice.toLocaleString()}
                  </p>
                )}
                {/* Price: NATS 32px, 88%, -0.011em */}
                <p className="font-nats text-[32px] leading-[0.88] tracking-[-0.011em] font-normal text-yellow-500 bg-yellow-50 rounded-md p-1 inline-block m-2">
                  ₹{pkg.price.toLocaleString()}
                </p>
                <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-600">
                  /person
                </p>
              </div>

              <div className="mt-4 space-x-2 space-y-3">
                <SuitabilityBar
                  label="Couples"
                  sublabel="For Newlywed Vacations"
                  percentage={pkg.suitability.couples}
                  icon={
                    <svg
                      className="w-6 h-6 text-pink-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  }
                />
                <SuitabilityBar
                  label="Family"
                  sublabel="For Family Vacations"
                  percentage={pkg.suitability.family}
                  icon={
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                />
              </div>

              {pkg.recentBookings > 0 && (
                <div className="mt-3 mb-2 flex  flex-row items-center justify-end space-x-2">
                  <div className="flex -space-x-1">
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-1 ring-white"
                      src="https://placehold.co/32x32/FFC107/FFFFFF/png?text=A"
                      alt="User A"
                    />
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-1 ring-white"
                      src="https://placehold.co/32x32/4CAF50/FFFFFF/png?text=B"
                      alt="User B"
                    />
                    <img
                      className="inline-block h-6 w-6 rounded-full ring-1 ring-white"
                      src="https://placehold.co/32x32/2196F3/FFFFFF/png?text=C"
                      alt="User C"
                    />
                  </div>
                  <p className="font-nats ">
                    {pkg.recentBookings} +
                    <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-600 m-2">
                      bookings in past month
                    </p>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sights Scroller - pushed to bottom */}
          {pkg.sights && pkg.sights.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-200">
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide">
                  {pkg.sights.map((sight: any, idx: number) => (
                    <span
                      key={idx}
                      className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-700 font-medium flex-shrink-0"
                    >
                      {typeof sight === 'string' ? sight : sight.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link> // ✅ CLOSE LINK
  )
}

export const TravelPackageExplorerClient: React.FC<{ packages: any[] }> = ({ packages = [] }) => {
  const [filters, setFilters] = useState<any>({})
  const [filteredPackages, setFilteredPackages] = useState(packages)

  useEffect(() => {
    let result = [...packages]

    // Price filter
    if (filters.priceRanges && filters.priceRanges.length > 0) {
      result = result.filter((p: any) => {
        return filters.priceRanges.some((range: string) => {
          const [min, max] = range.split('-').map(Number)
          return p.price >= min && p.price <= (max || Infinity)
        })
      })
    }

    // Rating filter
    if (filters.rating) {
      result = result.filter((p: any) => p.rating === filters.rating)
    }

    // Duration filter
    if (filters.duration && filters.duration.length > 0) {
      result = result.filter((p: any) => {
        return filters.duration.some((range: string) => {
          const [min, max] = range.split('-').map(Number)
          return p.duration >= min && p.duration <= max
        })
      })
    }

    // Experiences filter
    if (filters.experiences && filters.experiences.length > 0) {
      result = result.filter((p: any) =>
        filters.experiences.every((exp: string) => (p.experiences || []).includes(exp)),
      )
    }

    // Accommodation Type filter
    if (filters.accommodationType && filters.accommodationType.length > 0) {
      result = result.filter((p: any) => filters.accommodationType.includes(p.accommodationType))
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter((p: any) =>
        filters.amenities.every((am: string) => (p.amenities || []).includes(am)),
      )
    }

    // Provinces filter
    if (filters.provinces && filters.provinces.length > 0) {
      result = result.filter((p: any) => filters.provinces.includes(p.province))
    }

    setFilteredPackages(result)
  }, [filters, packages])

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <FontClasses />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <Filters filters={filters} setFilters={setFilters} packages={packages} />
          </aside>
          <main className="flex-grow">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg: any, idx: number) => (
                <PackageCard key={pkg.id || idx} pkg={pkg} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <h3 className="font-nats text-[20px] leading-[0.88] tracking-[-0.011em] text-gray-800">
                  No Packages Found
                </h3>
                <p className="font-nats text-[16px] leading-[0.88] tracking-[-0.011em] text-gray-600 mt-2">
                  Try adjusting your filters to find the perfect trip!
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default TravelPackageExplorerClient
