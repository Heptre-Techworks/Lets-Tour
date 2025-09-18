// src/collections/PackageCategories.ts
import type { CollectionConfig } from 'payload'

export const PackageCategories: CollectionConfig = {
  slug: 'package-categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true }, // no slug
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Experience', value: 'experience' },
        { label: 'Trip Type', value: 'trip_type' },
        { label: 'Vibe', value: 'vibe' },
        { label: 'Destination Label', value: 'destination_label' },
      ],
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'package-categories',
      admin: { description: 'Optional parent category' },
    },
    { name: 'description', type: 'textarea' },
  ],
}

export default PackageCategories
