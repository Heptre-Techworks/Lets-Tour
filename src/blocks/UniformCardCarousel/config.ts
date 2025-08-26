// payload/blocks/UniformCardCarousel.ts
import type { Block } from 'payload'

export const UniformCardCarousel: Block = {
  slug: 'uniformCardCarousel',
  labels: {
    singular: 'Uniform Card Carousel',
    plural: 'Uniform Card Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Featured Destinations',
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      maxRows: 12,
      admin: {
        description: 'Select destinations to feature in this carousel',
      },
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'rounded',
      options: [
        { label: 'Rounded Corners', value: 'rounded' },
        { label: 'Sharp Corners', value: 'sharp' },
      ],
    },
    {
      name: 'showLabels',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show labels (In Season, Popular)',
    },
    {
      name: 'showPricing',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show starting prices',
    },
    {
      name: 'cardsPerView',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '3 Cards', value: '3' },
        { label: '4 Cards', value: '4' },
        { label: '5 Cards', value: '5' },
      ],
    },
  ],
}
