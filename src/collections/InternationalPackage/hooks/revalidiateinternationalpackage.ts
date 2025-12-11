import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateInternationalPackage: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  const basePath = '/international-packages/'
  const tag = 'international-packages-sitemap'

  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `${basePath}${doc.slug}`
      payload.logger.info(`Revalidating international package at path: ${path}`)
      revalidatePath(path)
      revalidateTag(tag)
    }

    if (previousDoc?.slug && previousDoc?.slug !== doc?.slug) {
      const oldPath = `${basePath}${previousDoc.slug}`
      payload.logger.info(`Revalidating old international package path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag(tag)
    }
  }
  return doc
}

export const revalidateInternationalPackageDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { context, payload },
}) => {
  const basePath = '/international-packages/'
  const tag = 'international-packages-sitemap'

  if (!context?.disableRevalidate) {
    if (doc?.slug) {
      const path = `${basePath}${doc.slug}`
      payload.logger.info(`Revalidating deleted international package path: ${path}`)
      revalidatePath(path)
      revalidateTag(tag)
    }
  }
  return doc
}
