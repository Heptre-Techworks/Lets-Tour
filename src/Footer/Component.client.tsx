'use client'
import React from 'react'
import type { Footer } from '@/payload-types'
import { FooterNav } from './Nav'
import { FooterLogo } from './Nav/FooterLogo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const showThemeSelector = data?.showThemeSelector ?? true
  const hasGroups = Array.isArray(data?.navGroups) && data.navGroups.length > 0
  const hasSocialLinks = Array.isArray(data?.socialLinks) && data.socialLinks.length > 0
  const hasLegalLinks = Array.isArray(data?.legalLinks) && data.legalLinks.length > 0

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-gray-800">
          {/* Logo and Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <FooterLogo data={data} />
            
            {/* Description from CMS */}
            {data?.description && (
              <p className="text-sm text-gray-400 leading-relaxed max-w-md">
                {data.description}
              </p>
            )}
            
            {/* Social Links */}
            {hasSocialLinks && (
              <div className="flex gap-4 pt-2">
                {data.socialLinks?.map((item, i) => {
                  if (!item?.link) return null
                  return (
                    <CMSLink
                      key={i}
                      {...item.link}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
                    />
                  )
                })}
              </div>
            )}
            
            {showThemeSelector && (
              <div className="pt-2">
                <ThemeSelector />
              </div>
            )}
          </div>

          {/* Nav Groups Columns */}
          {hasGroups ? (
            data.navGroups?.map((group, i) => (
              <div key={i} className="space-y-4">
                {group.groupLabel && (
                  <h3 className="text-white font-semibold text-base uppercase tracking-wider">
                    {group.groupLabel}
                  </h3>
                )}
                <FooterNav data={{ navItems: group.links } as any} />
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-base uppercase tracking-wider">
                Quick Links
              </h3>
              <FooterNav data={data} />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center md:text-left">
            {data?.copyright}
          </p>

          {/* Legal Links */}
          {hasLegalLinks && (
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              {data.legalLinks?.map((item, i) => {
                if (!item?.link) return null
                return (
                  <CMSLink
                    key={i}
                    {...item.link}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-300"
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
