// src/collections/Exclusions.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Exclusions: CollectionConfig = {
  slug: 'exclusions',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['code', 'name'],
    group: 'Trip Configuration',
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
        description: 'Unique code (e.g., "EXC001", "INTL_FLIGHT")',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g., "International Flights", "Travel Insurance")',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Transportation', value: 'transportation' },
        { label: 'Meals', value: 'meals' },
        { label: 'Insurance', value: 'insurance' },
        { label: 'Personal Expenses', value: 'personal' },
        { label: 'Visas & Documents', value: 'documents' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export default Exclusions
