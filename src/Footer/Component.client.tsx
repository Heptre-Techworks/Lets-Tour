'use client'
import React from 'react'
import type { Footer } from '@/payload-types'
import { FooterNav } from './Nav'
import { FooterLogo } from './Nav/FooterLogo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const showThemeSelector = data?.showThemeSelector ?? true
  const hasGroups = Array.isArray(data?.navGroups) && data.navGroups.length > 0

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <FooterLogo data={data} />
          <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
            {showThemeSelector && <ThemeSelector />}
            {!hasGroups && <FooterNav data={data} />}
          </div>
        </div>

        {hasGroups && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.navGroups?.map((group, i) => (
              <div key={i} className="space-y-2">
                {group.groupLabel && (
                  <div className="text-sm uppercase tracking-wider text-neutral-400">
                    {group.groupLabel}
                  </div>
                )}
                <FooterNav data={{ navItems: group.links } as any} />
              </div>
            ))}
          </div>
        )}

        <div className="pt-6 text-sm text-neutral-400 border-t border-neutral-800">
          {data?.copyright}
        </div>
      </div>
    </footer>
  )
}
