// src/collections/Destinations/hooks/revalidateDestination.ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateDestination: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `/destinations/${doc.slug}`
      payload.logger.info(`Revalidating destination at path: ${path}`)
      revalidatePath(path)
      revalidateTag('destinations-sitemap')
    }
    if (previousDoc?.slug && previousDoc?.slug !== doc?.slug) {
      const oldPath = `/destinations/${previousDoc.slug}`
      payload.logger.info(`Revalidating old destination path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('destinations-sitemap')
    }
  }
  return doc
}

export const revalidateDestinationDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { context },
}) => {
  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `/destinations/${doc.slug}`
      revalidatePath(path)
      revalidateTag('destinations-sitemap')
    }
  }
  return doc
}
