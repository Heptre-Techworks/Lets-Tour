import { GlobalConfig } from "payload";

export const SearchFilters: GlobalConfig = {
  slug: 'search-filters',
  label: 'Search Filters',
  fields: [
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: {
        description: 'Featured destinations in search dropdown'
      }
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'package-categories',
      hasMany: true,
      admin: {
        description: 'Categories shown in search filter'
      }
    },
    {
      name: 'priceRanges',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true
        },
        {
          name: 'min',
          type: 'number'
        },
        {
          name: 'max',
          type: 'number'
        }
      ]
    }
  ]
}
