'use client'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import React from 'react'

export const CurateButton: React.FC<{ data: Header }> = ({ data }) => {
  const show = data?.curateButton?.show !== false
  const text = data?.curateButton?.text || 'Curate'
  const href = data?.curateButton?.href || '/curate'
  if (!show) return null

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  return (
    <Link
      href={href}
      // Mobile-first: smaller padding (px-6, py-1), then scales up for large screens (lg:px-8, lg:py-1.5)
      className="inline-flex items-center justify-center rounded-full bg-[#FBAE3D] px-6 py-1 lg:px-8 lg:py-1.5 transition-all duration-200"
      aria-label={text}
      onLinkClick={closeMobileMenu}
    >
      <span
        // Mobile-first: slightly smaller text (text-lg), then scales up for large screens (lg:text-[20px])
        className="font-sans text-white text-lg lg:text-[20px] leading-[0.88] tracking-[-0.011em]"
      >
        {text}
      </span>
    </Link>
  )
}
