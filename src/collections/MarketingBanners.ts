// src/collections/MarketingBanners.ts
import type { CollectionConfig } from 'payload'

export const MarketingBanners: CollectionConfig = {
  slug: 'marketing-banners',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'subtitle', type: 'text' },
    { name: 'percentageOff', type: 'number', min: 0, max: 100 },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'ctaText', type: 'text' },
    {
      name: 'ctaTarget',
      type: 'select',
      options: ['package', 'destination', 'category', 'url'],
    },
    {
      name: 'ctaRef',
      type: 'relationship',
      relationTo: ['packages', 'destinations', 'categories'],
      admin: { condition: (_, siblingData) => siblingData?.ctaTarget !== 'url' },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData?.ctaTarget === 'url' },
    },
    { name: 'sortOrder', type: 'number' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
