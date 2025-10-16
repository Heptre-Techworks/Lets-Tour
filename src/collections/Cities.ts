// src/collections/Cities/index.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const Cities: CollectionConfig = {
  slug: 'cities',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'destination', 'isPublished'],
    group: 'Content',
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
        description: 'City name (e.g., Barcelona, Madrid)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug',
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
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
      admin: {
        description: 'Parent destination',
      },
    },
    
    // ✅ NEW: For DestinationHero tabs
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Background image for hero tab (shown when city is selected)',
      },
    },
    
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief city description',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'City thumbnail/card image',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: { width: '50%' },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in destination hero tabs',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Cities
