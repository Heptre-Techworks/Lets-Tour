'use client'

import React from 'react'
import type { Footer } from '@/payload-types'
import { FooterNav } from './Nav'
import { FooterLogo } from './Nav/FooterLogo'
import { CMSLink } from '@/components/Link'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const hasGroups = Array.isArray(data?.navGroups) && data.navGroups.length > 0
  const hasSocialLinks = Array.isArray(data?.socialLinks) && data.socialLinks.length > 0
  const hasLegalLinks = Array.isArray(data?.legalLinks) && data.legalLinks.length > 0

  return (
    <footer className="w-full bg-black text-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {/* --- Top Section --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-gray-800">
          {/* --- Brand + Social --- */}
          <div className="lg:col-span-2 flex flex-col items-center sm:items-start space-y-5">
            <FooterLogo data={data} />

            {data?.description && (
              <p className="text-sm text-gray-400 leading-relaxed text-center sm:text-left max-w-md">
                {data.description}
              </p>
            )}

            {/* --- Social Links (dynamic if present in CMS) --- */}
            {hasSocialLinks && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
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
          </div>

          {/* --- Navigation Groups --- */}
          <div className="lg:col-span-3">
            {hasGroups ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center sm:text-left">
                {data.navGroups?.map((group, i) => (
                  <div key={i}>
                    {group.groupLabel && (
                      <h3 className="text-white font-semibold text-sm uppercase mb-3 tracking-wider">
                        {group.groupLabel}
                      </h3>
                    )}
                    <FooterNav data={{ navItems: group.links } as any} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 text-center sm:text-left">
                <div>
                  <h3 className="text-white font-semibold text-sm uppercase mb-3 tracking-wider">
                    Quick Links
                  </h3>
                  <FooterNav data={data} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Contact + Social + Legal Section --- */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center sm:text-left pt-5">
          {/* --- Follow --- */}
          <div>
            <h4 className="text-gray-400 font-medium mb-3">Follow Us</h4>
            <div className="flex justify-center sm:justify-start space-x-5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Lets-Tour/61552561924232/?mibextid=JRoKGi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-white transition-all duration-300 cursor-pointer"
              >
                <FaFacebookF />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/letstour.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-white transition-all duration-300 cursor-pointer"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-sm text-gray-500 order-2 md:order-1">
            {data?.copyright ?? '© 2025 GTholidays. All Rights Reserved.'}
          </p>

          {hasLegalLinks && (
            <div className="flex flex-wrap justify-center md:justify-end gap-4 order-1 md:order-2">
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
