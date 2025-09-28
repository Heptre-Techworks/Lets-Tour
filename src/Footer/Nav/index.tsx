'use client'
import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

export const FooterNav: React.FC<{ data: { navItems?: FooterType['navItems'] } }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item, i) => {
        if (!item?.link) return null
        return (
          <CMSLink
            className="text-white text-sm hover:opacity-80"
            key={i}
            {...item.link}
          />
        )
      })}
    </nav>
  )
}
