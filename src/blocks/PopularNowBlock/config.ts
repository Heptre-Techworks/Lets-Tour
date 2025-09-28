// src/blocks/PopularNow/config.ts
import type { Block } from 'payload';

export const PopularNow: Block = {
  slug: 'popularNow',
  interfaceName: 'PopularNowBlock',
  labels: { singular: 'Popular Now', plural: 'Popular Now' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Popular now!' },
    { name: 'subheading', type: 'text', defaultValue: "Today's enemy is tomorrow's friend." },
    { name: 'pauseOnHover', type: 'checkbox', defaultValue: true },
    {
      name: 'rows',
      type: 'array',
      required: true,
      labels: { singular: 'Row', plural: 'Rows' },
      fields: [
        {
          name: 'direction',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
        },
        {
          name: 'speedSeconds',
          type: 'number',
          defaultValue: 40,
          min: 5,
          max: 120,
          admin: { step: 1, description: 'Loop duration in seconds (lower is faster).' },
        },
        {
          name: 'cards',
          type: 'array',
          required: true,
          labels: { singular: 'Card', plural: 'Cards' },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'image', label: 'Image (upload)', type: 'upload', relationTo: 'media' },
                {
                  name: 'imageUrl',
                  label: 'Image (external URL)',
                  type: 'text',
                  admin: { description: 'Optional external image URL (e.g., Unsplash).' },
                },
              ],
            },
            { name: 'alt', type: 'text' },
          ],
        },
      ],
    },
  ],
};

export default PopularNow;
