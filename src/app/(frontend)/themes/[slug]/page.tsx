import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from '@/components/Link'
import Image from 'next/image' // Assuming you have a PackageCard component, importing it would be better, but building inline for speed now.

import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const { docs: themes } = await payload.find({
    collection: 'themes',
    limit: 0, // Fetch all documents
  });

  return themes.map((theme) => ({
    slug: theme.slug,
  }));
}

export default async function ThemeDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const payload = await getPayload({ config: configPromise })

  const { docs: themes } = await payload.find({
    collection: 'themes',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const theme = themes[0]

  if (!theme) return notFound()

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Hero for Theme */}
       <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center">
          {theme.featuredImage && typeof theme.featuredImage === 'object' && theme.featuredImage.url && (
            <Image
              src={theme.featuredImage.url}
              alt={theme.name}
              fill
              className="object-cover brightness-50"
            />
          )}
          <div className="relative z-10 text-center px-4">
             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 shadow-lg">{theme.name}</h1>
             {theme.description && (
               <p className="text-lg text-white/90 max-w-2xl mx-auto shadow-md">
                 {theme.description}
               </p>
             )}
          </div>
       </div>

       {/* Packages List using the re-usable Package Explorer logic or a simple list */}
       <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">Packages for {theme.name}</h2>
          
          {/* 
             Ideally we would reuse the TravelPackageExplorer block here.
             For now, I will render it by fetching the packages directly and passing to a component 
             OR simply using the Block if it accepts filtered data. 
             Since TravelPackageExplorer is a Client Component block, let's construct a server-side fetch for packages 
             and render a similar grid.
          */}
          
          <PackageListByTheme themeId={theme.id} />
       </div>
    </div>
  )
}

async function PackageListByTheme({ themeId }: { themeId: string }) {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: packages } = await payload.find({
    collection: 'packages',
    where: {
      themes: {
        contains: themeId
      },
      isPublished: {
        equals: true
      }
    },
    depth: 1
  })

  if (packages.length === 0) {
      return <div className="text-gray-500 italic">No packages found for this theme yet.</div>
  }

  // Reuse TravelPackageExplorer-like Card design or imported component
  // For simplicity/speed, using a basic grid mimicking the design
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       {packages.map((pkg) => {
          const imageSrc = typeof pkg.heroImage === 'object' && pkg.heroImage?.url ? pkg.heroImage.url : ''
          
          return (
            <Link 
              href={`/packages/${pkg.slug}`} 
              key={pkg.id}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
               <div className="relative h-64 overflow-hidden">
                  {imageSrc && (
                    <Image 
                      src={imageSrc} 
                      alt={pkg.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  )}
                  {pkg.discountedPrice && (
                     <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                     </div>
                  )}
               </div>
               <div className="p-5">
                   <h3 className="font-bold text-lg mb-1 group-hover:text-[#FBAE3D] transition-colors">{pkg.name}</h3>
                   <div className="text-sm text-gray-500 mb-3">{pkg.duration}</div>
                   <div className="flex items-center justify-between mt-4">
                      <div>
                         <span className="text-xs text-gray-400 block">Starting from</span>
                         <span className="font-bold text-xl">
                            {pkg.currency === 'USD' ? '$' : pkg.currency === 'EUR' ? '€' : '₹'} 
                            {pkg.price?.toLocaleString()}
                         </span>
                      </div>
                      <div className="text-[#FBAE3D] font-bold text-sm">View Details &rarr;</div>
                   </div>
               </div>
            </Link>
          )
       })}
    </div>
  )
}
