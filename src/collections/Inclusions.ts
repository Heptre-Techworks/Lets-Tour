// src/collections/Inclusions.ts
import type { CollectionConfig } from 'payload'

export const Inclusions: CollectionConfig = {
  slug: 'inclusions',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'code', type: 'text', unique: true, required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
}
