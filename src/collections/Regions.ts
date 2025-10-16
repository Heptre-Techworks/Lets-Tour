// src/collections/Regions.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Regions: CollectionConfig = {
  slug: 'regions',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'destination', 'type'],
    group: 'Taxonomies',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Region name (e.g., Catalonia, Andalusia)',
      },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
      admin: {
        description: 'Parent destination',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Province/State', value: 'province' },
        { label: 'Territory', value: 'territory' },
        { label: 'County', value: 'county' },
        { label: 'District', value: 'district' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of regional division',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'code',
      type: 'text',
      admin: {
        description: 'Region code (e.g., "CAT", "AND")',
      },
    },
  ],
}

export default Regions
