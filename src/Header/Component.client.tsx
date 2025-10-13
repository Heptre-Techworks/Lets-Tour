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
      className="w-full py-6"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <HeaderLogo data={data} />
          <div className="flex items-center gap-4">
            <Navigation data={data} />
            
          </div>
          <UserProfile />
        </div>
      </div>
    </header>
  )
}
