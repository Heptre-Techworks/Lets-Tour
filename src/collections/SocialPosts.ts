// src/collections/SocialPosts.ts
import type { CollectionConfig } from 'payload'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  admin: { useAsTitle: 'caption' },
  fields: [
    { name: 'platform', type: 'select', options: ['instagram'], required: true },
    { name: 'handle', type: 'text' },
    { name: 'externalId', type: 'text' },
    { name: 'caption', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'postedAt', type: 'date' },
    { name: 'isPinned', type: 'checkbox', defaultValue: false },
  ],
}
