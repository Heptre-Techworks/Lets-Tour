// src/blocks/ClientStories/config.ts
import type { Block } from 'payload';

export const ClientStories: Block = {
  slug: 'clientStories',
  interfaceName: 'ClientStoriesBlock',
  labels: { singular: 'Client Stories', plural: 'Client Stories' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Our client stories!' },
    {
      name: 'subheading',
      type: 'text',
      defaultValue:
        'Explore the wild west in all its glory this summer with your family and LetsTour',
    },
    { name: 'buttonText', type: 'text', defaultValue: 'View all' },
    {
      type: 'row',
      fields: [
        {
          name: 'background',
          label: 'Background (upload)',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'backgroundUrl',
          label: 'Background (external URL)',
          type: 'text',
          admin: { description: 'Optional external image URL.' },
        },
      ],
    },
    {
      name: 'cardsPerView',
      label: 'Cards per view (desktop)',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 4,
      admin: { step: 1, description: 'How many cards are visible at once.' },
    },
    {
      name: 'gapPx',
      label: 'Gap between cards (px)',
      type: 'number',
      defaultValue: 24,
      min: 0,
      max: 64,
      admin: { step: 2 },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      labels: { singular: 'Story Card', plural: 'Story Cards' },
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          admin: { step: 1 },
        },
        {
          name: 'story',
          type: 'textarea',
          required: true,
          admin: { rows: 4 },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'avatar',
              label: 'Avatar (upload)',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'avatarUrl',
              label: 'Avatar (external URL)',
              type: 'text',
            },
          ],
        },
        { name: 'alt', type: 'text', admin: { description: 'Image alt text.' } },
      ],
    },
  ],
};

export default ClientStories;
