// payload/blocks/NonUniformCardCarousel.ts
import type { Block } from 'payload'

export const NonUniformCardCarousel: Block = {
  slug: 'nonUniformCardCarousel',
  labels: {
    singular: 'Non Uniform Card Carousel',
    plural: 'Non Uniform Card Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'In Season',
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
        description: 'Select destinations - they will automatically get varied card sizes',
      },
    },
    {
      name: 'showDiscountBadge',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show discount badges (10% Off)',
    },
    {
      name: 'showLocationDetails',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show location details',
    },
    {
      name: 'cardSizePattern',
      type: 'select',
      defaultValue: 'varied',
      options: [
        { label: 'Varied Heights (Auto)', value: 'varied' },
        { label: 'Large-Medium-Small Pattern', value: 'pattern' },
        { label: 'Random Sizes', value: 'random' },
      ],
      admin: {
        description: 'How to distribute different card sizes',
      },
    },
    {
      name: 'backgroundColor',
      type: 'select',
      defaultValue: 'gray',
      options: [
        { label: 'Light Gray', value: 'gray' },
        { label: 'White', value: 'white' },
        { label: 'Cream', value: 'cream' },
      ],
    },
  ],
}
