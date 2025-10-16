// src/collections/Categories.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Categories: CollectionConfig<'categories'> = {
  slug: 'categories',
  
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'parent'],
    group: 'Taxonomies',
    description: 'Categories for experiences, trip types, vibes, and destination labels',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Category name (e.g., Adventure, Romantic, Family Friendly)',
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
        { label: 'Package Label', value: 'package_label' },
      ],
      required: true,
      admin: {
        description: 'Type of category for filtering and organization',
      },
    },

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from name)',
      },
    },

    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the category',
      },
    },

    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description: 'Optional parent category for hierarchy',
      },
    },

    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Icon for the category (optional)',
      },
    },

    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Badge/tag color (hex code)',
        placeholder: '#3B82F6',
      },
    },

    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower = appears first)',
      },
    },

    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Active categories appear in filters and badges',
      },
    },
  ],
}

export default Categories
