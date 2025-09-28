// src/collections/Destinations/index.ts
import type { CollectionConfig } from 'payload'
import { revalidateDestination, revalidateDestinationDelete } from './hooks/revalidateDestination'
import { slugField } from '@/fields/slug'

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'startingFromPricePerPerson', type: 'number', min: 0 },

    // CHANGE: point to 'categories' and filter to only Destination Label
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Destination label chips like Popular / In Season / Featured',
      },
      // Show only Destination Label categories
      filterOptions: {
        type: { equals: 'destination_label' },
      },
    },


    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateDestination],
    afterDelete: [revalidateDestinationDelete],
  },
}
export default Destinations
