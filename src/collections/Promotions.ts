// src/collections/Promotions.ts
import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'discountType', type: 'select', options: ['percent','amount'], required: true },
    { name: 'discountValue', type: 'number', required: true, min: 0 },
    { name: 'maxDiscountAmount', type: 'number' },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },

    // Targets
    { name: 'packages', type: 'relationship', relationTo: 'packages', hasMany: true },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
  ],
}
