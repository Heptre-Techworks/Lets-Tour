// src/hooks/revalidateSite.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import type { 
  CollectionAfterChangeHook, 
  CollectionAfterDeleteHook, 
  GlobalAfterChangeHook 
} from 'payload'

/**
 * Revalidate site after any collection change
 * Applies intelligent path revalidation based on collection type
 */
export const revalidateSite: CollectionAfterChangeHook = async ({ 
  req, 
  doc, 
  collection 
}) => {
  const { context } = req

  if (context.skipRevalidation) {
    return doc
  }

  const collectionSlug = collection.slug

  try {
    console.log(`🔄 Revalidating after ${collectionSlug} change`)

    // Always revalidate homepage
    revalidatePath('/')
    
    // Collection-specific revalidation
    switch (collectionSlug) {
      case 'packages':
        revalidatePath('/packages')
        revalidatePath('/packages/[slug]', 'page')
        if (doc.slug) {
          revalidatePath(`/packages/${doc.slug}`)
          console.log(`✅ Revalidated /packages/${doc.slug}`)
        }
        break
        
      case 'destinations':
        revalidatePath('/destinations')
        revalidatePath('/destinations/[slug]', 'page')
        if (doc.slug) {
          revalidatePath(`/destinations/${doc.slug}`)
          console.log(`✅ Revalidated /destinations/${doc.slug}`)
        }
        break
        
      case 'pages':
        if (doc.slug) {
          revalidatePath(`/${doc.slug}`)
          console.log(`✅ Revalidated /${doc.slug}`)
        }
        break
        
      case 'cities':
      case 'places':
        // These affect destination pages
        revalidatePath('/destinations')
        revalidatePath('/destinations/[slug]', 'page')
        break
        
      case 'vibes':
      case 'categories':
      case 'package-categories':
      case 'accommodation-types':
      case 'activities':
      case 'amenities':
      case 'inclusions':
      case 'exclusions':
        // These affect multiple pages - revalidate everything
        revalidatePath('/', 'layout')
        console.log(`✅ Full site revalidation (${collectionSlug} affects multiple pages)`)
        break
        
      case 'media':
        // Media changes affect any page using those images
        revalidatePath('/', 'layout')
        break
        
      case 'reviews':
        // Reviews affect package pages
        revalidatePath('/packages')
        revalidatePath('/packages/[slug]', 'page')
        break
        
      default:
        // Unknown collection - revalidate everything for safety
        revalidatePath('/', 'layout')
        console.log(`✅ Full site revalidation (unknown collection: ${collectionSlug})`)
    }
    
    // Revalidate cache tags
    revalidateTag('collection')
    revalidateTag(collectionSlug)
    revalidateTag(`collection_${collectionSlug}`) // Match getCachedCollection
    
    console.log(`✅ Site revalidated after ${collectionSlug} change`)
  } catch (error) {
    console.error(`❌ Revalidation error for ${collectionSlug}:`, error)
  }

  return doc
}

/**
 * Revalidate site after any collection deletion
 */
export const revalidateSiteOnDelete: CollectionAfterDeleteHook = async ({ 
  req, 
  doc, 
  collection 
}) => {
  const collectionSlug = collection.slug

  try {
    console.log(`🗑️ Revalidating after ${collectionSlug} deletion`)

    // Full revalidation on delete
    revalidatePath('/', 'layout')
    revalidateTag('collection')
    revalidateTag(collectionSlug)
    revalidateTag(`collection_${collectionSlug}`)
    
    console.log(`✅ Site revalidated after ${collectionSlug} deletion`)
  } catch (error) {
    console.error(`❌ Revalidation error on delete:`, error)
  }

  return doc
}

/**
 * Revalidate site after global config change
 */
export const revalidateGlobal: GlobalAfterChangeHook = async ({ 
  req, 
  doc, 
  global 
}) => {
  const globalSlug = global.slug

  try {
    console.log(`🌍 Revalidating after ${globalSlug} global change`)

    // Global changes affect entire site
    revalidatePath('/', 'layout')
    revalidateTag('global')
    revalidateTag(globalSlug)
    revalidateTag(`global_${globalSlug}`) // Match getCachedGlobal
    
    console.log(`✅ Site revalidated after ${globalSlug} change`)
  } catch (error) {
    console.error(`❌ Revalidation error for global:`, error)
  }

  return doc
}
