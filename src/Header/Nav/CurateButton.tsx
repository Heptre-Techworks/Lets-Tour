'use client'
import React from 'react'
import Link from 'next/link'
import type { Header } from '@/payload-types'

interface CurateButtonProps {
  data: Header
}

export const CurateButton: React.FC<CurateButtonProps> = ({ data }) => {
  const curateButton = data?.curateButton

  if (!curateButton?.show) return null

  const text = curateButton?.text || 'Curate'
  const href = curateButton?.href || '/curate'

  return (
    <Link href={href}>
      <div className="bg-[#fbae3d] box-border content-stretch flex gap-2.5 items-center justify-center px-8 py-1.5 relative rounded-[24px] shrink-0 hover:bg-[#e09935] transition-colors">
        <div className="flex flex-col font-['NATS:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-nowrap text-white tracking-[-0.22px]">
          <p className="leading-[0.88] whitespace-pre">{text}</p>
        </div>
      </div>
    </Link>
  )
}
