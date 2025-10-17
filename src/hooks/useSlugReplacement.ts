// src/hooks/useSlugReplacement.ts
'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Hook to replace {slug} placeholders with actual URL slug
 * Converts slug to title case (e.g., "spanish-escape" -> "Spanish Escape")
 */
export const useSlugReplacement = () => {
  const pathname = usePathname()

  const slugInfo = useMemo(() => {
    // Extract slug from various URL patterns
    const segments = pathname.split('/').filter(Boolean)
    
    // Get the last segment as slug (works for /destinations/spain, /packages/spanish-escape, etc.)
    const rawSlug = segments[segments.length - 1] || ''
    
    // Convert slug to title case
    const formattedSlug = rawSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    
    return {
      raw: rawSlug,
      formatted: formattedSlug,
    }
  }, [pathname])

  /**
   * Replace {slug} in any string with the formatted slug
   */
  const replaceSlug = (text: string | undefined | null): string => {
    if (!text) return ''
    return text.replace(/{slug}/gi, slugInfo.formatted)
  }

  return {
    slug: slugInfo.formatted,
    rawSlug: slugInfo.raw,
    replaceSlug,
  }
}
