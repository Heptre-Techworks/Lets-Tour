// src/blocks/PopularNow/config.ts
import type { Block } from 'payload';

export const PopularNow: Block = {
  slug: 'popularNow',
  interfaceName: 'PopularNowBlock',
  labels: { singular: 'Popular Now', plural: 'Popular Now' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Popular now!',
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
    },
    {
      name: 'pauseOnHover',
      type: 'checkbox',
      defaultValue: true,
    },

    // Rows configuration
    {
      name: 'rows',
      type: 'array',
      required: true,
      labels: { singular: 'Row', plural: 'Rows' },
      fields: [
        {
          name: 'dataSource',
          type: 'select',
          label: 'Data Source',
          defaultValue: 'manual',
          required: true,
          options: [
            { label: 'Manual Entry', value: 'manual' },
            { label: 'Featured Destinations', value: 'featured-destinations' },
            { label: 'Popular Destinations', value: 'popular-destinations' },
            { label: 'Featured Packages', value: 'featured-packages' },
            { label: 'Recent Packages', value: 'recent-packages' },
          ],
          admin: {
            description: 'Choose data source for this row',
          },
        },
        {
          name: 'itemLimit',
          type: 'number',
          defaultValue: 10,
          min: 1,
          max: 50,
          admin: {
            condition: (_, siblingData) => siblingData.dataSource !== 'manual',
            description: 'Number of items to display in this row',
          },
        },
        {
          name: 'direction',
          type: 'select',
          options: [
            { value: 'left', label: 'Left (default)' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'left',
          admin: {
            description: 'Scroll direction for this row',
          },
        },
        {
          name: 'speedSeconds',
          type: 'number',
          label: 'Speed (seconds for loop)',
          defaultValue: 40,
          min: 10,
          max: 200,
          admin: {
            description: 'How many seconds for a full loop',
          },
        },
        {
          name: 'cards',
          type: 'array',
          required: false,
          labels: { singular: 'Card', plural: 'Cards' },
          admin: {
            condition: (_, siblingData) => siblingData.dataSource === 'manual',
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'text', required: true },
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
                { name: 'alt', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default PopularNow;
