// payload/blocks/UpDownCardCarousel.ts
import type { Block } from 'payload'

export const UpDownCardCarousel: Block = {
  slug: 'upDownCardCarousel',
  labels: {
    singular: 'Up Down Card Carousel',
    plural: 'Up Down Card Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Popular now!',
      required: true,
      admin: {
        description: 'Main heading for the carousel section',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
      admin: {
        description: 'Subtitle text below the main title',
      },
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      maxRows: 8,
      admin: {
        description: 'Select destinations to display in the masonry layout',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'masonry',
      options: [
        { label: 'Masonry Layout', value: 'masonry' },
        { label: 'Grid Layout', value: 'grid' },
      ],
      admin: {
        description: 'Choose the layout style for the cards',
      },
    },
    {
      name: 'showStartingPrice',
      type: 'checkbox',
      label: 'Show Starting Price Text',
      defaultValue: true,
    },
  ],
}

export default UpDownCardCarousel
