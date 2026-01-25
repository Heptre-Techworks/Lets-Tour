'use client'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import React from 'react'

export const CurateButton: React.FC<{ data: Header }> = ({ data }) => {
  const show = data?.curateButton?.show !== false
  const text = data?.curateButton?.text || 'Curate'
  const href = data?.curateButton?.href || '/curate'
  if (!show) return null

  return (
    <Link
      href={href}
      aria-label={text}
      className="
    inline-flex items-center justify-center 
    rounded-full bg-[#FBAE3D] 
px-6 py-1 lg:px-8 lg:py-1.5    text-white shadow-md
    transition-all duration-300 ease-out
    hover:bg-[#e89d2d] hover:shadow-lg hover:-translate-y-0.5
    active:scale-95 active:shadow-inner
    group overflow-hidden relative
  "
    >
      {/* Optional: Subtle inner glow/gradient for depth */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <span
        className="
      relative z-10
      font-sans font-bold uppercase tracking-wider
      text-sm sm:text-base lg:text-lg
      leading-none
    "
        style={{
          letterSpacing: '0.05em', // Better readability for buttons
          textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {text}
      </span>
    </Link>
  )
}
