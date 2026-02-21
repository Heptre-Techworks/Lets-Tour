import type { Metadata, Viewport } from 'next'
import { PageTransitionProvider } from '@/providers/PageTransitionContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Inter, Roboto, Amiri, Kaushan_Script, Neuton } from 'next/font/google'
import localFont from 'next/font/local'
import React, { Suspense } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'
import { GlobalPreloader } from '@/components/GlobalPreloader'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { ScrollToTopFAB } from '@/components/ScrollToTopFAB'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const nats = localFont({
  src: '../fonts/NATS-Regular.woff',
  variable: '--font-nats',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

const amiri = Amiri({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-amiri',
  display: 'swap',
})

const kaushan = Kaushan_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-kaushan',
  display: 'swap',
})

const neuton = Neuton({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-neuton',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        nats.variable,
        inter.variable,
        roboto.variable,
        amiri.variable,
        kaushan.variable,
        neuton.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />

        {/* Performance Optimization: Preconnect to Google Fonts (for Admin/Dynamic fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Performance Optimization: Preconnect to Instagram */}
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://static.cdninstagram.com" crossOrigin="anonymous" />
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
            <main>{children}</main>
            <Footer />
            <WhatsAppFAB />
            <ScrollToTopFAB />
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
