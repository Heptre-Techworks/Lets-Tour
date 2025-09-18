// app/destinations-sitemap.xml/route.ts
import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

const getDestinationsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'destinations',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
    })

    const dateFallback = new Date().toISOString()
    return (results.docs ?? [])
      .filter((d: any) => Boolean(d?.slug))
      .map((d: any) => ({
        loc: `${SITE_URL}/destinations/${String(d.slug)}`,
        lastmod: d.updatedAt || dateFallback,
      }))
  },
  ['destinations-sitemap'],
  { tags: ['destinations-sitemap'] },
)

export async function GET() {
  const sitemap = await getDestinationsSitemap()
  return getServerSideSitemap(sitemap)
}
