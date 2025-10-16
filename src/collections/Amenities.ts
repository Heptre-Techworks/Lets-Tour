// src/collections/Amenities.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type'],
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
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Logistic', value: 'logistic' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Accommodation', value: 'accommodation' },
        { label: 'Food & Beverage', value: 'food' },
        { label: 'Transport', value: 'transport' },
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

export default Amenities
