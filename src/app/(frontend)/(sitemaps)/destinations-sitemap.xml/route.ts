// app/destinations-sitemap.xml/route.ts
import { getServerSideSitemap, type ISitemapField } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'

type Dest = RequiredDataFromCollectionSlug<'destinations'>

const getDestinationsSitemap = unstable_cache(
  async (): Promise<ISitemapField[]> => {
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
    const docs = (results.docs ?? []) as Dest[]

    const fields: ISitemapField[] = docs
      .filter((d) => Boolean(d.slug))
      .map((d) => ({
        loc: `${SITE_URL}/destinations/${String(d.slug)}`,
        lastmod: (d as any).updatedAt ?? dateFallback, // if updatedAt is in your schema, remove `as any`
      }))

    return fields
  },
  ['destinations-sitemap'],
  { tags: ['destinations-sitemap'] },
)

export async function GET() {
  const fields = await getDestinationsSitemap()
  return getServerSideSitemap(fields)
}
