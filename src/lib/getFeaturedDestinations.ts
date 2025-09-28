import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export async function getFeaturedCategoryId() {
  const payload = await getPayloadHMR({ config: configPromise })
  const res = await payload.find({
    collection: 'categories',
    where: {
      and: [
        { type: { equals: 'destination_label' } },
        { name: { equals: 'Featured' } }, // if categories use "title", adjust to title: { equals: 'Featured' }
      ],
    },
    limit: 1,
  })
  return res.docs[0]?.id as string | undefined
}

export async function getFeaturedDestinations(limit = 8) {
  const payload = await getPayloadHMR({ config: configPromise })
  const featuredId = await getFeaturedCategoryId()
  if (!featuredId) return { docs: [] }

  return payload.find({
    collection: 'destinations',
    where: {
      labels: { contains: featuredId },
    },
    depth: 1, // populate heroImage and labels
    limit,
  })
}
