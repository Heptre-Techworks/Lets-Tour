// src/collections/AccommodationTypes.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const AccommodationTypes: CollectionConfig = {
  slug: 'accommodation-types',
  
  admin: {
    useAsTitle: 'name',
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
      admin: {
        description: 'E.g., "5-Star Hotel", "Beach Resort", "Villa"',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Hotel', value: 'hotel' },
        { label: 'Resort', value: 'resort' },
        { label: 'Villa', value: 'villa' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Guesthouse', value: 'guesthouse' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}

export default AccommodationTypes
