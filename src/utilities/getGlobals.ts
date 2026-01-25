// src/utilities/getGlobals.ts
import type { Config } from 'src/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, depth = 0) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })

// CACHE UTILITY FOR COLLECTIONS
export const getCachedCollection = (collection: keyof Config['collections'], query: any) =>
  unstable_cache(async () => {
    const payload = await getPayload({ config: configPromise })
    return payload.find({
       collection,
       ...query
    })
  }, [collection, JSON.stringify(query)], {
    tags: [`collection_${collection}`],
    revalidate: 600 // 10 minutes default
  })
