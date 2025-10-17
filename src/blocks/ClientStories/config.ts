// src/blocks/ClientStories/config.ts
import type { Block } from 'payload';

export const ClientStories: Block = {
  slug: 'clientStories',
  interfaceName: 'ClientStoriesBlock',
  labels: { singular: 'Client Stories', plural: 'Client Stories' },
  fields: [
    { 
      name: 'heading', 
      type: 'text', 
      defaultValue: 'Our client stories from {slug}!',
      admin: {
        description: 'Use {slug} to auto-replace with destination/package name',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: 'Hear what travelers say about {slug}',
      admin: {
        description: 'Use {slug} for dynamic text replacement',
      },
    },
    { 
      name: 'buttonText', 
      type: 'text', 
      defaultValue: 'View all' 
    },
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
      name: 'overlay',
      label: 'Overlay (upload)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Decorative overlay image placed behind cards.' },
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
    
    // ✅ COLLECTION INTEGRATION
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual Cards', value: 'manual' },
        { label: 'From Reviews Collection', value: 'collection' },
        { label: 'Featured Reviews', value: 'featured' },
      ],
      admin: {
        description: 'Choose how to populate review cards',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData.populateBy !== 'manual',
        description: 'Number of reviews to fetch from collection',
      },
    },
    {
      name: 'cards',
      type: 'array',
      labels: { singular: 'Story Card', plural: 'Story Cards' },
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'manual',
      },
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
      ],
    },
  ],
};

export default ClientStories;
