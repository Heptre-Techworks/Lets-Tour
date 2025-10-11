// app/(frontend)/(sitemaps)/packages-sitemap.xml/route.ts
import { getServerSideSitemap, type ISitemapField } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'

type Package = RequiredDataFromCollectionSlug<'packages'>

const getPackagesSitemap = unstable_cache(
  async (): Promise<ISitemapField[]> => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'packages',
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
    
    // Type assertion: ensure docs have slug and updatedAt
    const docs = results.docs as Array<Package & { slug: string; updatedAt: string }>

    const fields: ISitemapField[] = docs
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        loc: `${SITE_URL}/packages/${p.slug}`,
        lastmod: p.updatedAt ?? dateFallback,
      }))

    return fields
  },
  ['packages-sitemap'],
  { revalidate: 3600, tags: ['packages-sitemap'] },
)

export async function GET() {
  const fields = await getPackagesSitemap()
  return getServerSideSitemap(fields)
}
