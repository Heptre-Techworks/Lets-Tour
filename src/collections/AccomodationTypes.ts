// src/collections/AccommodationTypes.ts
import type { CollectionConfig } from 'payload'

export const AccommodationTypes: CollectionConfig = {
  slug: 'accommodation-types',
  admin: { useAsTitle: 'name' },
  fields: [{ name: 'name', type: 'text', required: true }],
}
