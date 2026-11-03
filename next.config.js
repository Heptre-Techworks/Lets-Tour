// next.config.js
import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true, // Enable Gzip compression
    images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Media URLs are built from process.env.NEXT_PUBLIC_SERVER_URL (e.g. www.letstour.in),
      // which can differ from the Vercel production URL, so allow both.
      ...[...new Set([NEXT_PUBLIC_SERVER_URL, process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean))].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.144',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zozxszsaofxvunkl.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // FIXED: Use serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ['payload', 'nodemailer', '@payloadcms/payload-cloud'],

  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Prevent client-side bundling of Node.js modules
    if (!isServer) {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        util: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
      }
    }

    return webpackConfig
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  redirects,
  async headers() {
    // Keep the admin (incl. its login page) and the auth endpoints out of every
    // search engine / bot index. `/admin/:path*` also matches `/admin` itself.
    const noIndex = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
      },
    ]
    return ['/admin/:path*', '/api/auth/:path*', '/api/users/:path*'].map((source) => ({
      source,
      headers: noIndex,
    }))
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
