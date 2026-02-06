import React from 'react'
import { AccreditationsGrid as AccreditationsGridBlockProps } from '@/payload-types'
import { AccreditationsGrid as AccreditationsGridComponent } from '@/components/AccreditationsGrid'

type Props = {
  disableInnerContainer?: boolean
} & AccreditationsGridBlockProps

export const AccreditationsGrid: React.FC<Props> = (props) => {
  const { heading, images } = props

  // Transform payload data format to component format
  const formattedImages = images?.map((item) => {
    if (typeof item.image === 'object' && item.image !== null && 'url' in item.image) {
      return {
        url: item.image.url as string,
        alt: item.image.alt || 'Accreditation',
        width: item.image.width,
        height: item.image.height,
      }
    }
    return null
  }).filter(Boolean) as any[]

  return (
    <AccreditationsGridComponent 
      heading={heading || undefined} 
      images={formattedImages} 
    />
  )
}
