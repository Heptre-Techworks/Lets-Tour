'use client'
import React from 'react'
import type { Footer } from '@/payload-types'
import { FooterNav } from './Nav/index'
import { FooterLogo } from './Nav/FooterLogo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const showThemeSelector = data?.showThemeSelector ?? true

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <FooterLogo data={data} />
        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          {showThemeSelector && <ThemeSelector />}
          <FooterNav data={data} />
        </div>
      </div>
    </footer>
  )
}
