import React from 'react'
import Image from 'next/image'
interface Media {
  url: string
  alt?: string
}

interface Props {
  image: Media
  // Allows the height to be dynamic based on content or to enforce a specific ratio/size.
  // We'll keep the current hardcoded height scaling as a default for robustness.
  heightClass?: string
  overlay?: boolean
  overlayOpacity?: number
}

const StaticImageBlock: React.FC<Props> = ({
  image,
  // Use a sensible default height class that scales well.
  // Added a default `min-h-[40vh]` for screens medium and above for better view on tablets/large phones.
  heightClass = 'h-[250px] xs:h-[350px] sm:h-[400px] md:min-h-[80vh] lg:min-h-[100vh',
  overlay = true,
  overlayOpacity = 0.5,
}) => {
  if (!image?.url) {
    return null
  }

  return (
    <section className="relative w-full max-w-full overflow-hidden">
      <div
        className={`
          relative w-full
          // 💡 Dynamic height class applied here
          ${heightClass}
          overflow-hidden
        `}
      >
        {/* ✅ Responsive Image */}
        <Image
          fill
          src={image.url}
          alt={image.alt || ''}
          // The key to responsiveness: w-full h-full ensures the image fills the container.
          // object-cover ensures the image covers the area without distortion, cropping as needed.
          className="
            absolute top-0 left-0 w-full h-full object-cover
          "
        />

        {/* ✅ Optional Overlay */}
        {overlay && (
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>
    </section>
  )
}

export default StaticImageBlock
