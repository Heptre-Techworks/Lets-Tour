// src/collections/Activities.ts
import type { CollectionConfig } from 'payload'

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['adventure', 'leisure', 'cultural', 'other'], required: true },
  ],
}
