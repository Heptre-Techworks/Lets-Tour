import type { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc as {
    slug?: string
    id?: string | number
    categories?: Array<string | { id: string | number; name?: string } | null | undefined>
    title?: string
    meta?: {
      title?: string | null
      image?: { id?: string | number } | string | null
      description?: string | null
      [k: string]: unknown
    }
  }

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: (typeof meta?.image === 'object' && meta?.image?.id) || meta?.image || undefined,
      description: meta?.description ?? undefined,
    },
    categories: [],
  }

  if (Array.isArray(categories) && categories.length > 0) {
    const normalized: Array<{ id: string | number; name: string }> = []

    for (const category of categories) {
      if (!category) continue

      if (typeof category === 'object') {
        normalized.push({
          id: category.id,
          name: category.name || 'Untitled category',
        })
        continue
      }

      // category is an ID
      const doc = await req.payload.findByID({
        collection: 'categories',
        id: category,
        disableErrors: true,
        depth: 0,
        select: { name: true }, // select the correct field from your schema
        req,
      })

      if (doc) {
        // doc will include id and the selected fields
        normalized.push({
          id: (doc as any).id,
          name: (doc as any).name || 'Untitled category',
        })
      } else {
        console.error(
          `Failed. Category not found when syncing collection '${String(collection)}' with id: '${String(
            id,
          )}' to search.`,
        )
      }
    }

    modifiedDoc.categories = normalized.map((each) => ({
      relationTo: 'categories',
      // the search plugin expects a reference-like shape; keep both ID and human label
      categoryID: String(each.id),
      title: each.name,
    }))
  }

  return modifiedDoc
}
