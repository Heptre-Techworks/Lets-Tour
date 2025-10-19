'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type MediaLike = { url?: string | null; alt?: string | null };

const getImageSrc = (image: MediaLike | string | null | undefined): string => {
  if (image && typeof image === 'object' && 'url' in image && image?.url) {
    return image.url as string;
  }
  return '';
};

// Star Icon Component
const StarIcon = () => (
  <svg
    className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Positional styles for the gallery images
const imagePositions = [
  { width: '40.4%', height: '36.7%', left: '0%', top: '9.3%' },
  { width: '47.6%', height: '35.8%', left: '41.8%', top: '0%' },
  { width: '34.6%', height: '62.7%', left: '41.8%', top: '37.3%' },
  { width: '34.6%', height: '25.3%', left: '5.8%', top: '47.6%' },
  { width: '22.2%', height: '17.2%', left: '18.2%', top: '74.5%' },
  { width: '22.2%', height: '17.2%', left: '77.8%', top: '37.3%' },
  { width: '22.2%', height: '28%', left: '77.8%', top: '56.1%' },
];

type PackageHighlightsClientProps = {
  dataSource?: string
  heading?: string
  subheading?: string
  highlights?: Array<{ highlightText?: string }>
  galleryImages?: Array<{ image?: any }>
}

export const PackageHighlightsClient: React.FC<PackageHighlightsClientProps> = ({
  dataSource = 'manual',
  heading: initialHeading = 'Package highlights',
  subheading: initialSubheading = "Today's enemy is tomorrow's friend.",
  highlights: initialHighlights = [],
  galleryImages: initialGalleryImages = [],
}) => {
  const pathname = usePathname()
  const [heading, setHeading] = useState(initialHeading)
  const [subheading, setSubheading] = useState(initialSubheading)
  const [highlights, setHighlights] = useState(initialHighlights)
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages)
  const [loading, setLoading] = useState(dataSource === 'auto')

  // ✅ Auto-fetch package data from URL (same pattern as DynamicScroller)
  useEffect(() => {
    const fetchPackageData = async () => {
      if (dataSource !== 'auto') return
      
      // Extract package slug from URL
      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'packages') {
        console.warn('⚠️ Not on a package page, cannot auto-fetch')
        setLoading(false)
        return
      }
      
      const packageSlug = segments[1]
      if (!packageSlug) {
        console.warn('⚠️ No package slug in URL')
        setLoading(false)
        return
      }

      console.log(`🔍 Client auto-fetching package highlights for: ${packageSlug}`)

      try {
        const response = await fetch(`/api/packages?where[slug][equals]=${packageSlug}&depth=2&limit=1`)
        const data = await response.json()
        
        if (data.docs[0]) {
          const pkg = data.docs[0]
          
          // Transform highlights
          const transformedHighlights = (pkg.highlights || []).map((h: any) => ({
            highlightText: h.text || ''
          }))

          // Get gallery images
          const galleryArray = Array.isArray(pkg.gallery) ? pkg.gallery : []
          const transformedGallery = galleryArray.slice(0, 7).map((img: any) => ({
            image: img
          }))

          // Fill remaining slots
          while (transformedGallery.length < 7 && pkg.heroImage) {
            transformedGallery.push({ image: pkg.heroImage })
          }

          console.log(`✅ Client loaded ${transformedHighlights.length} highlights, ${transformedGallery.length} images`)

          setHeading(`${pkg.name} Highlights`)
          setSubheading(pkg.tagline || pkg.summary || 'Discover what makes this package special')
          setHighlights(transformedHighlights)
          setGalleryImages(transformedGallery)
        } else {
          console.warn('⚠️ Package not found')
        }
      } catch (error) {
        console.error('❌ Error fetching package data on client:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackageData()
  }, [pathname, dataSource])

  if (loading) {
    return (
      <div className="font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          Loading package highlights...
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Text Content */}
        <div className="text-[#3C2A21]">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 italic">
            {heading}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {subheading}
          </p>
          <ul className="space-y-3">
            {Array.isArray(highlights) &&
              highlights.map((item, index) => (
                <li key={index} className="flex items-start">
                  <StarIcon />
                  <span className="text-base md:text-lg">{item?.highlightText || ''}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Right Column: Absolutely Positioned Image Gallery */}
        <div className="w-full relative" style={{ paddingBottom: '91.18%' }}>
          {Array.isArray(galleryImages) &&
            galleryImages.slice(0, 7).map((imageItem, index) => {
              const imageSrc = getImageSrc(imageItem?.image);
              if (!imageSrc) return null;

              return (
                <div
                  key={index}
                  className="absolute overflow-hidden rounded-lg shadow-xl transition-transform duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
                  style={imagePositions[index]}
                >
                  <img
                    src={imageSrc}
                    alt={
                      imageItem?.image && typeof imageItem.image === 'object'
                        ? imageItem.image.alt || `Gallery image ${index + 1}`
                        : `Gallery image ${index + 1}`
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/400/CCCCCC/FFFFFF?text=Image+Error';
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PackageHighlightsClient;
