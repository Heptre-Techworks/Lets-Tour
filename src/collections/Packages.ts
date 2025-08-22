import { CollectionConfig } from "payload"

export const Packages: CollectionConfig = {
  slug: 'packages',
  labels: {
    singular: 'Package',
    plural: 'Packages'
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'destination', 'price', 'duration', 'featured']
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ value, operation, data }) => {
            if (operation === 'create' || !value) {
              return data?.title?.toLowerCase().replace(/ /g, '-')
            }
            return value
          }
        ]
      }
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: true
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 200
    },
    {
      name: 'detailedDescription',
      type: 'richText',
      required: true
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0
    },
    {
      name: 'originalPrice',
      type: 'number',
      admin: {
        description: 'Original price before discount'
      }
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'INR'
    },
    {
      name: 'priceUnit',
      type: 'select',
      options: [
        { label: 'Per Person', value: 'per-person' },
        { label: 'Per Group', value: 'per-group' },
        { label: 'Per Family', value: 'per-family' }
      ],
      defaultValue: 'per-person'
    },
    {
      name: 'duration',
      type: 'group',
      fields: [
        {
          name: 'days',
          type: 'number',
          required: true
        },
        {
          name: 'nights',
          type: 'number',
          required: true
        }
      ]
    },
    {
      name: 'itinerary',
      type: 'text',
      admin: {
        description: 'e.g., Madrid 2N, Seville 2N, Granada 1N'
      }
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'package-categories',
      hasMany: true
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Popular', value: 'popular' },
        { label: 'In Season', value: 'in-season' },
        { label: 'Family Friendly', value: 'family-friendly' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Relaxing', value: 'relaxing' },
        { label: 'Glamping', value: 'glamping' },
        { label: 'Girls Day Out', value: 'girls-day-out' },
        { label: 'Vibe Match', value: 'vibe-match' }
      ]
    },
    {
      name: 'discount',
      type: 'group',
      fields: [
        {
          name: 'hasDiscount',
          type: 'checkbox',
          defaultValue: false
        },
        {
          name: 'percentage',
          type: 'number',
          min: 0,
          max: 100
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'e.g., "10% Off", "Special Offer"'
          }
        }
      ]
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'caption',
          type: 'text'
        }
      ]
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        step: 0.1
      }
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Coming Soon', value: 'coming-soon' }
      ],
      defaultValue: 'active'
    },
    {
      name: 'inclusions',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true
        }
      ]
    },
    {
      name: 'exclusions',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true
        }
      ]
    }
  ]
}
