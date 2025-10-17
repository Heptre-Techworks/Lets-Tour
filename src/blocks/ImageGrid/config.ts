// src/blocks/ImageGrid/config.ts
import type { Block } from 'payload';

export const ImageGrid: Block = {
  slug: 'imageGrid',
  interfaceName: 'ImageGridBlock',
  labels: { singular: 'Image Grid', plural: 'Image Grids' },
  fields: [
    {
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Featured Destinations', value: 'featured' },
        { label: 'Select Destination', value: 'destination' },
        { label: 'Select Package', value: 'package' },
      ],
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'destination',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'package',
      },
    },
    {
      name: 'featuredLimit',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 10,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'featured',
      },
    },

    // Manual data
    {
      name: 'manualData',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      fields: [
        {
          name: 'leftHero',
          type: 'group',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'rating', type: 'number', min: 0, max: 5, admin: { step: 0.1 } },
            { name: 'trail', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'explore',
          type: 'group',
          fields: [
            { name: 'subtitle', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            {
              name: 'button',
              type: 'group',
              fields: [
                { name: 'label', type: 'text' },
                { name: 'href', type: 'text' },
              ],
            },
          ],
        },
        {
          name: 'spots',
          type: 'array',
          maxRows: 3,
          fields: [
            { name: 'name', type: 'text' },
            { name: 'rating', type: 'number', min: 0, max: 5, admin: { step: 0.1 } },
            { name: 'location', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'activities',
          type: 'group',
          fields: [
            { name: 'subtitle', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            {
              name: 'button',
              type: 'group',
              fields: [
                { name: 'label', type: 'text' },
                { name: 'href', type: 'text' },
              ],
            },
            { name: 'tag', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },

    {
      name: 'labels',
      type: 'group',
      fields: [
        { name: 'ratingPrefix', type: 'text', defaultValue: '⭐ ' },
      ],
    },

    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'dark', type: 'checkbox', defaultValue: true },
        { name: 'container', type: 'checkbox' },
      ],
    },
  ],
};

export default ImageGrid;
