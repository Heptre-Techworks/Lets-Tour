// src/collections/PackageCategories.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const PackageCategories: CollectionConfig = {
  slug: 'package-categories',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'parent'],
    group: 'Trip Configuration',
    hidden: true,
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
      admin: {
        description: 'Category name (e.g., "For Couples", "Family Friendly")',
      },
    },
    // ✅ ADD THIS FIELD
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly slug',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
    },
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
      admin: {
        description: 'Optional parent category for hierarchy',
      },
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

export default PackageCategories
