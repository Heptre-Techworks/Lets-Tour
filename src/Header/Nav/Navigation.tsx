'use client'
import React from 'react'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import { CurateButton } from './CurateButton'

interface NavigationProps {
  data: Header
}

export const Navigation: React.FC<NavigationProps> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <div className="content-stretch flex gap-8 items-center justify-start relative shrink-0">
      {navItems.map((item, index) => (
        <Link 
          key={index}
          href={item.href || '#'}
          className="font-['NATS:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[24px] text-white tracking-[-0.264px] hover:text-gray-200 transition-colors"
        >
          <p className="leading-[0.88]">{item.label}</p>
        </Link>
      ))}
      <CurateButton data={data} />
    </div>
  )
}
