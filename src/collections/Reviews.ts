// src/collections/Reviews.ts
import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'package', type: 'relationship', relationTo: 'packages' },
    { name: 'destination', type: 'relationship', relationTo: 'destinations' },
    { name: 'rating', type: 'number', min: 1, max: 5, required: true },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea' },
    {
      name: 'photos',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
    },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
