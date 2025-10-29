// src/components/site/Header/Nav/CurateButton.tsx
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
      className="inline-flex items-center justify-center rounded-full bg-[#FBAE3D] px-8 py-1.5"
      aria-label={text}
    >
      <span className="font-sans text-white text-[20px] leading-[0.88] tracking-[-0.011em]">
        {text}
      </span>
    </Link>
  )
}
