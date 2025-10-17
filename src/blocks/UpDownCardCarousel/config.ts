// src/blocks/UpDownCarousel/config.ts
import type { Block } from 'payload';

export const UpDownCardCarousel: Block = {
  slug: 'upDownCardCarousel',
  interfaceName: 'UpDownCardCarouselBlock',
  labels: { singular: 'Up Down Carousel', plural: 'Up Down Carousel' },
  fields: [
    {
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'inSeason',
      required: true,
      options: [
        { label: 'In Season Destinations', value: 'inSeason' },
        { label: 'Featured Destinations', value: 'featured' },
        { label: 'Popular Destinations', value: 'popular' },
        { label: 'Featured Packages', value: 'featuredPackages' },
        { label: 'Recent Packages', value: 'recentPackages' },
        { label: 'Honeymoon Packages', value: 'honeymoonPackages' },
        { label: 'Family Packages', value: 'familyPackages' },
        { label: 'Manual Entry', value: 'manual' },
      ],
      admin: {
        description: 'Choose destinations or packages to display',
      },
    },
    {
      name: 'itemLimit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource !== 'manual',
        description: 'Number of items to display',
      },
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'In Season',
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.*",
      admin: {
        description: 'Optional tagline shown under the heading.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      labels: { singular: 'Card', plural: 'Cards' },
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'details', type: 'text' },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { step: 1, description: 'Price in INR.' },
        },
        { name: 'discount', type: 'text' },
        {
          type: 'row',
          fields: [
            {
              name: 'image',
              label: 'Image (upload)',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'imageUrl',
              label: 'Image (external URL)',
              type: 'text',
            },
          ],
        },
        { name: 'alt', type: 'text' },
        { name: 'href', type: 'text', label: 'Link URL' },
      ],
    },
  ],
};

export default UpDownCardCarousel;
