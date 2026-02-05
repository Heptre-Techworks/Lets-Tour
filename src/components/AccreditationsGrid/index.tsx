import React from 'react'
import Image from 'next/image'

type AccreditationImage = {
  url: string
  alt: string
  width?: number
  height?: number
}

interface AccreditationsGridProps {
  heading?: string
  images: AccreditationImage[]
}

export const AccreditationsGrid: React.FC<AccreditationsGridProps> = ({ 
  heading = "Our Accreditations",
  images 
}) => {
  if (!images || images.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {heading && (
          <h2 className="text-3xl font-bold text-center mb-10 font-sans text-gray-900">
            {heading}
          </h2>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative w-full h-24 sm:h-32 flex items-center justify-center p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50"
            >
              <div className="relative w-full h-full">
                <Image
                  src={img.url}
                  alt={img.alt || `Accreditation ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AccreditationsGrid
