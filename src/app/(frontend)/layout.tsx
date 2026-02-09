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
import React, { Suspense } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'
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

  // Extract font family names from the links or theme data if available
  // Assuming the first font is Heading and second is Body for simplicity, or just generating vars
  // We'll generate --font-0, --font-1, etc. based on the order.
  // We also need to construct the font-family string.
  // Google Fonts URL format: ...family=Font+Name:wght@...
  // Simple extraction regex for now or just rely on the user providing the name in the CMS if we had that data handy here.
  // The theme object has 'name' field as per ThemeSettings.ts. Let's use that.

  let fontStyles = '';
  try {
     const theme: any = await getCachedGlobal('theme-settings' as any)()
     if (theme?.fonts) {
        theme.fonts.forEach((f: any, i: number) => {
            if (f.link && f.name) {
                fontLinks.push(f.link);
                // Sanitize font name for CSS variable if needed, but usually the name itself is fine for usage
                // font-family: 'Name', sans-serif;
                fontStyles += `--font-${i}: '${f.name}', sans-serif;\n`;
            }
        });
     }
  } catch (e) {
     console.error('Error processing fonts:', e);
  }


  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        
        {/* Performance Optimization: Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {fontLinks.map((link, i) => (
          <link key={i} href={link} rel="stylesheet" />
        ))}
        
        {/* Dynamic Font Variables */}
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                    ${fontStyles}
                    --font-heading: var(--font-0, 'Geist Sans'); /* Default to first font or Geist */
                    --font-body: var(--font-1, var(--font-0, 'Geist Sans')); /* Default to second or first */
                }
            `
        }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <PageTransitionProvider>
            <AdminBar
                adminBarProps={{
                preview: isEnabled,
                }}
            />

            <GlobalPreloader />
            <Header />
            <main>
                {children}
            </main>
            <Footer />
            <WhatsAppFAB />
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
