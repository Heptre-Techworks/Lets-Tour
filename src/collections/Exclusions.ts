// src/collections/Exclusions.ts
import type { CollectionConfig } from 'payload'

export const Exclusions: CollectionConfig = {
  slug: 'exclusions',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'code', type: 'text', unique: true, required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
}
