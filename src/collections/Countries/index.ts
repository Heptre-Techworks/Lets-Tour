import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'continent', 'region'],
    group: 'Taxonomy', 
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
      unique: true,
      admin: {
        description: 'Country name (e.g., France, Japan)',
      },
    },
    ...slugField(),
    {
      name: 'continent',
      type: 'select',
      required: true,
      options: [
        { label: 'Asia', value: 'asia' },
        { label: 'Europe', value: 'europe' },
        { label: 'North America', value: 'north-america' },
        { label: 'South America', value: 'south-america' },
        { label: 'Africa', value: 'africa' },
        { label: 'Oceania', value: 'oceania' },
      ],
      admin: {
        description: 'The continent this country belongs to.',
      },
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      admin: {
        description: 'Region this country belongs to (optional, but good for filtering).',
      },
    },
     {
      name: 'flag',
      type: 'upload',
      relationTo: 'media',
         admin: {
        description: 'Optional flag image.',
      },
    },
  ],
}
