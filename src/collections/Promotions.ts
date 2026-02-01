// src/collections/Promotions.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'discountType', 'discountValue', 'isActive'],
    group: 'Website Content',
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
        description: 'Promotion name (e.g., "Summer Sale 2025")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Promotion details and terms',
      },
    },
    {
      name: 'displayText',
      type: 'text',
      admin: {
        description: 'Badge text (e.g., "10% Off")',
        placeholder: '10% Off',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'discountType',
          type: 'select',
          options: [
            { label: 'Percentage', value: 'percent' },
            { label: 'Fixed Amount', value: 'amount' },
          ],
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'discountValue',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            width: '50%',
            description: '10 for 10% or ₹1000 for fixed amount',
          },
        },
      ],
    },
    {
      name: 'maxDiscountAmount',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum discount cap (for percentage discounts)',
      },
    },
    {
      name: 'badgeColor',
      type: 'text',
      admin: {
        description: 'Badge color (hex code)',
        placeholder: '#FF5733',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'endsAt',
          type: 'date',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional promotional banner',
      },
    },
    {
      name: 'packages',
      type: 'relationship',
      relationTo: 'packages',
      hasMany: true,
      admin: {
        description: 'Specific packages this applies to (leave empty for all)',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categories this applies to',
      },
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: {
        description: 'Destinations this applies to',
      },
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      admin: {
        description: 'Optional promo code (e.g., SUMMER2025)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Promotions
