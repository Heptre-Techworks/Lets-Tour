// src/collections/SocialPosts/index.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  
  admin: {
    useAsTitle: 'postUrl',
    defaultColumns: ['postUrl', 'platform', 'isFeatured', 'createdAt'],
    group: 'Website Content',
    description: 'Manage social media posts for Instagram carousel',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'instagram',
      options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter/X', value: 'twitter' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'postUrl',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Full Instagram post URL (e.g., https://www.instagram.com/p/ABC123...)',
      },
      validate: (val: unknown) => {
        const v = String(val || '')
        const ok = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/.test(v)
        return ok || 'Provide a valid Instagram post URL (post, reel, or TV).'
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption or description',
      },
    },
    {
      name: 'showCaption',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show caption in embed',
      admin: {
        description: 'Force show Instagram caption in the embed',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional fallback thumbnail',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in featured carousels',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order in carousel',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default SocialPosts
