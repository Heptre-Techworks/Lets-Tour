'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Header, Media } from '@/payload-types'

interface HeaderLogoProps {
  data: Header
  className?: string
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ 
  data, 
  className = "h-8 w-[181px]" 
}) => {
  const logo = data?.logo as Media

  if (!logo?.url) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <div className="text-2xl font-bold text-white tracking-wide">
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
        width={logo.width || 181}
        height={logo.height || 32}
        className="object-contain"
        priority
      />
    </Link>
  )
}
