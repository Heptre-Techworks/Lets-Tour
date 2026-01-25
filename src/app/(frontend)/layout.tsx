import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <InitTheme />
        {/* Dynamic Favicon */}
        {(async () => {
          try {
            const headerData: any = await getCachedGlobal('header', 1)()
            const logo = headerData?.logo
            let logoUrl = '/favicon.svg' // fallback
            if (logo && typeof logo === 'object' && logo.url) {
                logoUrl = logo.url
            } else if (typeof logo === 'string') {
                logoUrl = logo
            }
            return <link href={logoUrl} rel="icon" />
          } catch (e) {
            return <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
          }
        })()}
        
        {/* Dynamic Google Fonts Injection */}
        {(async () => {
           try {
             // We can't use type-safe 'theme-settings' yet if types aren't regenerated. Cast to any.
             const theme: any = await getCachedGlobal('theme-settings' as any)()
             const fonts = theme?.fonts || []
             
             if (fonts.length === 0) return null

             return (
               <>
                 {fonts.map((f: any, i: number) => (
                    f.link ? <link key={i} href={f.link} rel="stylesheet" /> : null
                 ))}
               </>
             )
           } catch (e) {
             return null
           }
        })()}
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
