// src/collections/Packages/index.ts
import type { CollectionConfig } from 'payload'
import { revalidatePackage, revalidatePackageDelete } from './hooks/revalidatePackage'
import { slugField } from '@/fields/slug'

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'summary', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'price', type: 'number', min: 0 },
    { name: 'duration', type: 'text' }, // e.g., "7 days", "2 weeks"
    
    // Relationship to destinations
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: {
        description: 'Destinations included in this package',
      },
    },

    // Package labels/categories
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Package labels like Best Seller / Premium / Budget',
      },
      filterOptions: {
        type: { equals: 'package_label' },
      },
    },

    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePackage],
    afterDelete: [revalidatePackageDelete],
  },
}

export default Packages
