// src/collections/Packages/hooks/revalidatePackage.ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidatePackage: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `/packages/${doc.slug}`
      payload.logger.info(`Revalidating package at path: ${path}`)
      revalidatePath(path)
      revalidateTag('packages-sitemap')
    }
    if (previousDoc?.slug && previousDoc?.slug !== doc?.slug) {
      const oldPath = `/packages/${previousDoc.slug}`
      payload.logger.info(`Revalidating old package path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('packages-sitemap')
    }
  }
  return doc
}

export const revalidatePackageDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { context },
}) => {
  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `/packages/${doc.slug}`
      revalidatePath(path)
      revalidateTag('packages-sitemap')
    }
  }
  return doc
}
