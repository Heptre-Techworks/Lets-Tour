// src/collections/MarketingBanners.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const MarketingBanners: CollectionConfig = {
  slug: 'marketing-banners',
  
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'percentageOff', 'isActive', 'sortOrder'],
    group: 'Marketing',
  },

  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Banner headline (e.g., "UP TO 60% OFF")',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Supporting text',
      },
    },
    {
      name: 'percentageOff',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Discount percentage to display',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Banner background image',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      admin: {
        description: 'Button text (e.g., "Explore Packages")',
      },
    },
    {
      name: 'ctaTarget',
      type: 'select',
      options: [
        { label: 'Package', value: 'package' },
        { label: 'Destination', value: 'destination' },
        { label: 'Category', value: 'category' },
        { label: 'Custom URL', value: 'url' },
      ],
      admin: {
        description: 'What the CTA button links to',
      },
    },
    {
      name: 'ctaRef',
      type: 'relationship',
      relationTo: ['packages', 'destinations', 'categories'],
      admin: {
        condition: (_, siblingData) => siblingData?.ctaTarget !== 'url',
        description: 'Select the target item',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.ctaTarget === 'url',
        description: 'Custom URL (e.g., /about-us)',
      },
    },
    {
      name: 'displayLocation',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Homepage Hero', value: 'homepage_hero' },
        { label: 'Homepage Secondary', value: 'homepage_secondary' },
        { label: 'Package Listing', value: 'package_listing' },
      ],
      admin: {
        description: 'Where to show this banner',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower = shown first)',
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

export default MarketingBanners
