// components/blocks/StaticImageBlock.tsx
import React from 'react'

interface Props {
  image: {
    url: string
    alt?: string
  } | string
  overlay?: boolean
  height?: 'small' | 'medium' | 'large' | 'xl'
}

const StaticImageBlock: React.FC<Props> = ({ 
  image, 
  overlay = true, 
  height = 'medium' 
}) => {
  const imageUrl = typeof image === 'string' ? image : image?.url
  const altText = typeof image === 'string' ? '' : image?.alt || ''

  const getHeightClass = () => {
    switch (height) {
      case 'small':
        return 'h-80'
      case 'large':
        return 'h-[500px]'
      case 'xl':
        return 'h-[600px]'
      case 'medium':
      default:
        return 'h-96'
    }
  }

  if (!imageUrl) {
    return null
  }

  return (
    <section className={`relative w-full ${getHeightClass()}`}>
      <img
        src={imageUrl}
        alt={altText}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
    </section>
  )
}

export default StaticImageBlock
