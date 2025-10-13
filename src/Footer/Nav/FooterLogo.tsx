'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Footer, Media } from '@/payload-types'

interface FooterLogoProps {
  data: Footer
  className?: string
}

export const FooterLogo: React.FC<FooterLogoProps> = ({
  data,
  className = '',
}) => {
  const logo = data?.logo as Media

  if (!logo?.url) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <div className="text-3xl font-bold text-white tracking-wide">
          TOUR
        </div>
      </Link>
    )
  }

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src={logo.url}
        alt={logo.alt || 'Logo'}
        width={logo.width || 180}
        height={logo.height || 45}
        className="object-contain"
      />
    </Link>
  )
}
