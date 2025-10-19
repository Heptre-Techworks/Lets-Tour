// src/plugins/autoRevalidate.ts
import type { Config, Plugin } from 'payload'
import { revalidateSite, revalidateSiteOnDelete, revalidateGlobal } from '@/hooks/revalidateSite'

export const autoRevalidatePlugin: Plugin = (incomingConfig: Config): Config => {
  const config = { ...incomingConfig }

  // Add revalidation hooks to ALL collections automatically
  const collectionsWithHooks = (config.collections || []).map((collection) => {
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [
          ...(collection.hooks?.afterChange || []),
          revalidateSite,
        ],
        afterDelete: [
          ...(collection.hooks?.afterDelete || []),
          revalidateSiteOnDelete,
        ],
      },
    }
  })

  // Add revalidation to ALL globals automatically
  const globalsWithHooks = (config.globals || []).map((global) => {
    return {
      ...global,
      hooks: {
        ...global.hooks,
        afterChange: [
          ...(global.hooks?.afterChange || []),
          revalidateGlobal,
        ],
      },
    }
  })

  return {
    ...config,
    collections: collectionsWithHooks,
    globals: globalsWithHooks,
  }
}
