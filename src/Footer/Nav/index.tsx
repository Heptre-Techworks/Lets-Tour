'use client'
import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

export const FooterNav: React.FC<{ data: { navItems?: FooterType['navItems'] } }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex flex-col gap-3">
      {navItems.map((item, i) => {
        if (!item?.link) return null
        return (
          <CMSLink
            className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-block"
            key={i}
            {...item.link}
          />
        )
      })}
    </nav>
  )
}
