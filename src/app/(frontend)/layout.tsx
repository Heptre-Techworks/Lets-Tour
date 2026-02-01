import type { Metadata } from 'next'
import { PageTransitionProvider } from '@/providers/PageTransitionContext'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React, { Suspense } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { GlobalPreloader } from '@/components/GlobalPreloader'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  let fontLinks: string[] = []

  // Removed dynamic favicon logic which was using the large logo and causing blurriness

  try {
     const theme: any = await getCachedGlobal('theme-settings' as any)()
     if (theme?.fonts) {
       fontLinks = theme.fonts.map((f: any) => f.link).filter(Boolean)
     }
  } catch (e) {
    console.error('Error fetching theme fonts:', e)
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {fontLinks.map((link, i) => (
          <link key={i} href={link} rel="stylesheet" />
        ))}
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <PageTransitionProvider>
            <AdminBar
                adminBarProps={{
                preview: isEnabled,
                }}
            />

            <Suspense fallback={null}>
            <GlobalPreloader />
          </Suspense>
            <Header />
            <main>
                {children}
            </main>
            <Footer />
          </PageTransitionProvider>
        </Providers>
        <Analytics />
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
