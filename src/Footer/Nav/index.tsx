'use client'
import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

export const FooterNav: React.FC<{ data: FooterType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex flex-col md:flex-row gap-4">
      {navItems.map((item, i) => {
        if (!item?.link) return null
        
        return (
          <CMSLink 
            className="text-white" 
            key={i} 
            {...item.link} 
          />
        )
      })}
    </nav>
  )
}
