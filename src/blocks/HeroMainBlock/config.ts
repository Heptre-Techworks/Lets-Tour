// payload/blocks/HeroMainBlock.ts
import type { Block } from 'payload'

export const HeroMainBlock: Block = {
  slug: 'heroMainBlock',
  labels: {
    singular: 'Hero Main Block',
    plural: 'Hero Main Blocks',
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Hero Slides',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'The main background image for the slide.',
          },
        },
        {
          name: 'title',
          type: 'text',
          defaultValue: 'To travel is to live!',
        },
        {
          name: 'subtitle',
          type: 'text',
          defaultValue: '10,348 ft',
        },
        {
          name: 'location',
          type: 'text',
          defaultValue: 'Mount Everest',
        },
      ],
    },
    {
      name: 'cloudImage',
      label: 'Cloud Image Overlay',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload a PNG image of clouds with a transparent background. This will be layered at the bottom.',
      },
    },
    {
      name: 'enableAirplaneAnimation',
      type: 'checkbox',
      label: 'Enable Airplane Animations',
      defaultValue: true,
    },
    {
      name: 'autoplayDuration',
      type: 'number',
      defaultValue: 8000, // Increased for a more graceful animation
      admin: {
        description: 'Autoplay interval in milliseconds (e.g., 8000 = 8 seconds).',
      },
    },
    // --- Form Fields ---
    {
      type: 'collapsible',
      label: 'Search Form Configuration',
      fields: [
        {
          name: 'destinationOptions',
          type: 'array',
          label: 'Destination Options',
          defaultValue: [
            { label: 'Spain', value: 'spain' },
            { label: 'France', value: 'france' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
        {
          name: 'categoryOptions',
          type: 'array',
          label: 'Category Options',
          defaultValue: [
            { label: 'Adventure', value: 'adventure' },
            { label: 'Honeymoon', value: 'honeymoon' },
          ],
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
        {
          name: 'buttonLabel',
          type: 'text',
          defaultValue: 'Apply',
        },
        {
          name: 'placeholders',
          type: 'group',
          fields: [
            { name: 'destination', type: 'text', defaultValue: 'Destination' },
            { name: 'date', type: 'text', defaultValue: 'Date' },
            { name: 'people', type: 'text', defaultValue: 'No of people' },
            { name: 'category', type: 'text', defaultValue: 'Category' },
          ],
        },
      ],
    },
  ],
}
