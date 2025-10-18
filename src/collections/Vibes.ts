// src/collections/Vibes.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Vibes: CollectionConfig = {
  slug: 'vibes',
  
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
        description: 'Vibe name (e.g., "Outdoor", "Relaxing", "Glamping")',
      },
    },
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
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of this vibe',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Icon/image representing this vibe',
      },
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Orange (In Season)', value: 'orange' },
        { label: 'Red (Popular)', value: 'red' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Purple', value: 'purple' },
      ],
      admin: {
        description: 'Badge color for this vibe',
      },
    },
  ],
}

export default Vibes
