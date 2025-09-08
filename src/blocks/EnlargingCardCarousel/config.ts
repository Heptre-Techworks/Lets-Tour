
// payload/blocks/EnlargingCardCarousel.ts
import type { Block } from 'payload'

export const EnlargingCardCarousel: Block = {
  slug: 'enlargingCardCarousel',
  labels: {
    singular: 'Enlarging Card Carousel',
    plural: 'Enlarging Card Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Explore Destinations',
      required: true,
      admin: {
        description: 'Main heading for the carousel section',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: 'Discover amazing places around the world',
      admin: {
        description: 'Subtitle text below the main title',
      },
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      maxRows: 6,
      admin: {
        description: 'Select destinations to display in the enlarging carousel',
      },
    },
    {
      name: 'showNavigation',
      type: 'checkbox',
      label: 'Show Navigation Arrows',
      defaultValue: true,
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      label: 'Auto Play Carousel',
      defaultValue: false,
    },
    {
      name: 'enlargeOnHover',
      type: 'checkbox',
      label: 'Enlarge Cards on Hover',
      defaultValue: true,
    },
  ],
}

export default EnlargingCardCarousel
