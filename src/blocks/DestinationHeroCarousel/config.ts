// src/blocks/DestinationHeroCarousel/config.ts
import type { Block } from 'payload'

export const DestinationHeroCarousel: Block = {
  slug: 'destinationHeroCarousel',
  labels: {
    singular: 'Destination Hero Carousel',
    plural: 'Destination Hero Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Things to do in {slug}',
      required: true,
      admin: {
        description: 'Main title. Use {slug} for auto-replacement (e.g., "Things to do in {slug}" → "Things to do in Spain")',
      },
    },
    
    // ✅ COLLECTION INTEGRATION
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto (from URL)', value: 'auto' },
        { label: 'Select Destination', value: 'destination' },
        { label: 'Manual Stops', value: 'manual' },
      ],
      admin: {
        description: 'How to populate attractions',
      },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'destination',
        description: 'Select destination to show its places',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 8,
      min: 3,
      max: 15,
      admin: {
        condition: (_, siblingData) => siblingData.populateBy !== 'manual',
        description: 'Number of places to show',
      },
    },
    {
      name: 'stops',
      label: 'Manual Travel Stops',
      type: 'array',
      minRows: 3,
      maxRows: 10,
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'manual',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
        },
      ],
    },
    {
      name: 'timingSettings',
      type: 'group',
      label: 'Timing Settings',
      fields: [
        {
          name: 'autoplayDelay',
          type: 'number',
          defaultValue: 5000,
          min: 1000,
          max: 20000,
          required: true,
          admin: {
            description: 'Auto-scroll delay in milliseconds',
            step: 500,
          },
        },
        {
          name: 'transitionDuration',
          type: 'number',
          defaultValue: 500,
          min: 100,
          max: 2000,
          required: true,
          admin: {
            description: 'Transition duration in milliseconds',
            step: 100,
          },
        },
      ],
    },
  ],
}

export default DestinationHeroCarousel
