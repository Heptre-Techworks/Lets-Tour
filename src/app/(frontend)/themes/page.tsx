import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ThemesPage() {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: themes } = await payload.find({
    collection: 'themes',
    limit: 100,
    sort: 'name',
  })

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50">
       <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Explore by Theme</h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            Find the perfect trip style for you. Whether you want romance, adventure, or relaxation, we have curated experiences just for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {themes.map((theme) => {
               const imageSrc = theme.featuredImage && typeof theme.featuredImage === 'object' && theme.featuredImage.url
                 ? theme.featuredImage.url
                 : '/images/placeholder-theme.jpg' // You might want a better fallback
                 
               return (
                 <Link 
                   href={`/themes/${theme.slug}`} 
                   key={theme.id}
                   className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                 >
                    <div className="relative h-48 w-full overflow-hidden">
                       {imageSrc && (
                         <Image 
                           src={imageSrc} 
                           alt={theme.name}
                           fill
                           className="object-cover transition-transform duration-500 group-hover:scale-110"
                         />
                       )}
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    
                    <div className="p-5">
                       <h3 className="text-xl font-bold mb-2 group-hover:text-[#FBAE3D] transition-colors">
                         {theme.name}
                       </h3>
                       {theme.description && (
                         <p className="text-gray-500 text-sm line-clamp-2">
                           {theme.description}
                         </p>
                       )}
                    </div>
                 </Link>
               )
             })}
          </div>
          
          {themes.length === 0 && (
            <div className="text-center py-20 text-gray-400 italic">
               No themes found. Please add some in the Admin Panel.
            </div>
          )}
       </div>
    </div>
  )
}
