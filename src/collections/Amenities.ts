// src/collections/Amenities.ts
import type { CollectionConfig } from 'payload'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['logistic', 'accessibility', 'accommodation', 'other'], required: true },
  ],
}
