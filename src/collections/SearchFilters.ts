// src/globals/SearchFilters.ts
import { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const SearchFilters: GlobalConfig = {
  slug: 'search-filters',
  label: 'Search Filters',
  
  admin: {
    group: 'Settings',
  },

  access: {
    read: anyone,
    update: authenticated,
  },

  fields: [
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: {
        description: 'Featured destinations in search dropdown',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'package-categories',
      hasMany: true,
      admin: {
        description: 'Categories shown in search filter',
      },
    },
    {
      name: 'priceRanges',
      type: 'array',
      labels: {
        singular: 'Price Range',
        plural: 'Price Ranges',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Display label (e.g., "₹2,500 - ₹5,000")',
          },
        },
        {
          name: 'min',
          type: 'number',
          min: 0,
        },
        {
          name: 'max',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'durationRanges',
      type: 'array',
      labels: {
        singular: 'Duration Range',
        plural: 'Duration Ranges',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'minDays',
          type: 'number',
          min: 1,
        },
        {
          name: 'maxDays',
          type: 'number',
          min: 1,
        },
      ],
    },
  ],
}

export default SearchFilters
