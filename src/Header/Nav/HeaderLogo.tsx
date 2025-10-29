// src/components/site/Header/Nav/HeaderLogo.tsx
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
    <div className="shrink-0">
      {src ? (
        <Image
          src={src}
          alt="Logo"
          width={181}
          height={32}
          className="h-[32px] w-auto"
          priority
        />
      ) : (
        <div className="h-[32px] w-[181px] bg-white/20 rounded" />
      )}
    </div>
  )
}
