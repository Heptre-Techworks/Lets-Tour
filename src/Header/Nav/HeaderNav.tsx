'use client'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { Navigation } from './Navigation'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  return (
    <header
      className="
        w-full 
        flex items-center justify-between 
        px-3 sm:px-2 md:px-3 lg:px-6 
        py-2 sm:py-3 md:py-4 
        bg-transparent 
        backdrop-blur-md 
        transition-all 
        duration-300 
        relative z-50
      "
    >
      {/* Navigation bar */}
      <div className="flex w-full items-center justify-between gap-2 sm:gap-4 md:gap-6">
        <Navigation data={data} />
      </div>
    </header>
  )
}
