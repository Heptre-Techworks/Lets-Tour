'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { HeaderLogo } from './Nav/HeaderLogo'
import { Navigation } from './Nav/Navigation'
import { UserProfile } from './Nav/UserProfile'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  return (
    <header
      className="w-full py-6 relative"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <HeaderLogo data={data} />
          <div className="flex-1 min-w-0">
            <Navigation data={data} />
          </div>
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
