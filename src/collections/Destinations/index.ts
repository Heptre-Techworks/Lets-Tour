// src/collections/Destinations/index.ts
import type { CollectionConfig } from 'payload'
import { revalidateDestination, revalidateDestinationDelete } from './hooks/revalidateDestination'
import { slugField } from '@/fields/slug' // reuse same helper used by Pages

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: { useAsTitle: 'name' },

  access: { read: () => true },

  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'startingFromPricePerPerson', type: 'number', min: 0 },
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'package-categories',
      hasMany: true,
      admin: { description: 'Destination label chips like Popular/In Season' },
    },
    ...slugField(), // adds { slug } with unique, auto-gen behavior
  ],

  hooks: {
    afterChange: [revalidateDestination],
    afterDelete: [revalidateDestinationDelete],
  },
}

export default Destinations
