// src/collections/Activities.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Activities: CollectionConfig = {
  slug: 'activities',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type'],
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
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Adventure', value: 'adventure' },
        { label: 'Leisure', value: 'leisure' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Water Sports', value: 'water_sports' },
        { label: 'Nature', value: 'nature' },
        { label: 'Food & Dining', value: 'dining' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
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
  ],
}

export default Activities
