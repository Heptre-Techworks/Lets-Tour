import React from 'react'

interface Media {
  url: string
  alt?: string
}

interface Props {
  image: Media
  overlay?: boolean
  overlayOpacity?: number
}

const StaticImageBlock: React.FC<Props> = ({ image, overlay = true, overlayOpacity = 0.5 }) => {
  if (!image?.url) {
    return null
  }

  return (
    <section className="relative w-full max-w-full overflow-hidden">
      <div
        className="
          relative w-full 
          h-[300px] sm:h-[450px] md:h-[600px] lg:h-[750px]
          overflow-hidden
        "
      >
        {/* ✅ Responsive Image */}
        <img
          src={image.url}
          alt={image.alt || ''}
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
