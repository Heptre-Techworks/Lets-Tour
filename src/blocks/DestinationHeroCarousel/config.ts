// payload/blocks/DestinationHeroCarousel.ts
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
      defaultValue: 'Things to do in Spain',
      required: true,
      admin: {
        description: 'Main title for the hero section',
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
            description: 'Name of the attraction (e.g., Park Güell)',
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
      name: 'displaySettings',
      type: 'group',
      label: 'Display Settings',
      fields: [
        {
          name: 'showActiveScale',
          type: 'checkbox',
          defaultValue: true,
          label: 'Scale Active Card',
          admin: {
            description: 'Scale up the centered card',
          },
        },
        {
          name: 'visibleWindow',
          type: 'number',
          defaultValue: 3,
          admin: {
            description: 'Number of cards visible at once',
          },
        },
      ],
    },
  ],
}

export default DestinationHeroCarousel
