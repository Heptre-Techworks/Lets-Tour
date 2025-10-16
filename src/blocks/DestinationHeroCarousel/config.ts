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
      defaultValue: 'Things to do in {destination}',
      required: true,
      admin: {
        description: 'Main title for the hero section. Use {destination} as a placeholder for the destination name.',
      },
    },
    {
      name: 'destination',
      type: 'text',
      defaultValue: 'Spain',
      required: true,
      admin: {
        description: 'Destination name (e.g., Spain, France, Italy)',
      },
    },
    {
      name: 'stops',
      label: 'Travel Stops',
      type: 'array',
      minRows: 3,
      maxRows: 10,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the attraction (e.g., Sagrada Familia)',
          },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          admin: {
            description: 'City where the attraction is located',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Hero image for the attraction',
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Short description of the attraction',
          },
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            description: 'URL slug for the attraction page (optional)',
          },
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
            description: 'Time in milliseconds before auto-scrolling to next slide (1000ms = 1 second)',
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
            description: 'Transition animation duration in milliseconds (1000ms = 1 second)',
            step: 100,
          },
        },
      ],
    },
  ],
}

export default DestinationHeroCarousel
