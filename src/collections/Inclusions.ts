// src/collections/Inclusions.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Inclusions: CollectionConfig = {
  slug: 'inclusions',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name'],
    group: 'Taxonomies',
  },

  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },

  fields: [
    {
      name: 'code',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'Unique code (e.g., "INC001", "BREAKFAST")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., "Daily Breakfast", "Airport Transfers")',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Transportation', value: 'transportation' },
        { label: 'Meals', value: 'meals' },
        { label: 'Activities', value: 'activities' },
        { label: 'Guides', value: 'guides' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'inclusion-image',
      },
    },
  ],
}

export default Inclusions
