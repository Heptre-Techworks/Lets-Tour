// src/collections/Places/index.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import slugify from 'slugify'
import _ from 'lodash'

export const Places: CollectionConfig = {
  slug: 'places',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'destination', 'isPublished'],
    group: 'Travel Management',
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
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (value) {
              return _.startCase(_.toLower(value))
            }
            return value
          },
        ],
      },
      admin: {
        description: 'Place name (e.g., Sagrada Familia, Royal Palace)',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return slugify(data.name, { lower: true, strict: true })
            }
            return value
          },
        ],
      },
    },
    
    // ✅ NEW: For carousel cards
    {
      name: 'shortDescription',
      type: 'richText',
      required: true,
      admin: {
        description: 'Brief excerpt for carousel cards (max 150 chars)',
      },
    },
    
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Full place description',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Main place image for carousel',
      },
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Landmark', value: 'landmark' },
        { label: 'Museum', value: 'museum' },
        { label: 'Park', value: 'park' },
        { label: 'Beach', value: 'beach' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Nightlife', value: 'nightlife' },
        { label: 'Activity', value: 'activity' },
      ],
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
        description: 'Order in carousel (lower = appears first)',
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

export default Places
