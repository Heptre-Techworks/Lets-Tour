'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Footer, Media } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'

interface FooterLogoProps {
  data: Footer
  className?: string
}

export const FooterLogo: React.FC<FooterLogoProps> = ({
  data,
  className = 'flex items-center',
}) => {
  const logo = data?.logo as Media

  if (!logo?.url) {
    return (
      <Link className={className} href="/">
        <Logo />
      </Link>
    )
  }

  return (
    <Link className={className} href="/">
      <Image
        src={logo.url}
        alt={logo.alt || 'Footer Logo'}
        width={logo.width || 150}
        height={logo.height || 40}
        className="object-contain"
      />
    </Link>
  )
}
