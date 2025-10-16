// app/(frontend)/(sitemaps)/destinations-sitemap.xml/route.ts
import { getServerSideSitemap, type ISitemapField } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'

type Destination = RequiredDataFromCollectionSlug<'destinations'>

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
      limit: 10000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()
    
    const docs = results.docs as Array<Destination & { slug: string; updatedAt: string }>

    const fields: ISitemapField[] = docs
      .filter((d) => Boolean(d.slug))
      .map((d) => ({
        loc: `${SITE_URL}/destinations/${d.slug}`,
        lastmod: d.updatedAt ?? dateFallback,
      }))

    return fields
  },
  ['destinations-sitemap'],
  { revalidate: 3600, tags: ['destinations-sitemap'] },
)

export async function GET() {
  const fields = await getDestinationsSitemap()
  return getServerSideSitemap(fields)
}
