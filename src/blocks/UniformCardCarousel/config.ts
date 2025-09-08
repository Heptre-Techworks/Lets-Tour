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
      defaultValue: 'In Season',
      admin: {
        description: 'Main title for the carousel section',
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
      relationTo: 'destinations', // This matches your collection slug
      hasMany: true,
      maxRows: 10,
      admin: {
        description: 'Select destinations to display in the carousel',
      },
    },
    {
      name: 'showNavigation',
      type: 'checkbox',
      label: 'Show Navigation Arrows',
      defaultValue: true,
    },
  ],
}

export default UniformCardCarousel
