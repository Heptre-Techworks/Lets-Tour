'use client'
import Image from 'next/image'
import type { Header } from '@/payload-types'
import React from 'react'

export const HeaderLogo: React.FC<{ data: Header }> = ({ data }) => {
  const logo: any = data?.logo
  const src =
    typeof logo === 'string'
      ? logo
      : logo?.url || logo?.src || (logo?.sizes?.thumbnail?.url ?? null)

  return (
    <div
      className="
        shrink-0
        flex items-center justify-center
        max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px]
        overflow-hidden
        rounded-2xl
        bg-white/10 sm:bg-transparent
        shadow-[0_4px_15px_rgba(0,0,0,0.25)] sm:shadow-none
        ring-1 ring-white/10 sm:ring-0
        backdrop-blur-sm sm:backdrop-blur-0
        transition-all duration-300
      "
    >
      {src ? (
        <Image
          src={src}
          alt="Logo"
          width={240}
          height={60}
          priority
          className="
            h-[28px] xs:h-[30px] sm:h-[34px] md:h-[38px] lg:h-[42px]
            w-auto 
            object-contain
            transition-all duration-300
          "
        />
      ) : (
        <div
          className="
            h-[28px] xs:h-[30px] sm:h-[34px] md:h-[38px] lg:h-[42px]
            w-[120px] sm:w-[160px] md:w-[180px] lg:w-[200px]
            bg-white/20 rounded
          "
        />
      )}
    </div>
  )
}
