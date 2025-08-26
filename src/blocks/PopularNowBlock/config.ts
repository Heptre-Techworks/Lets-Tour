// payload/blocks/PopularNowBlock.ts
import type { Block } from 'payload'

export const PopularNowBlock: Block = {
  slug: 'popularNowBlock',
  labels: {
    singular: 'Popular Now Block',
    plural: 'Popular Now Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Popular now!',
      required: false,
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
      required: false,
    },
    {
      name: 'cards',
      type: 'array',
      admin: {
        description: 'Add destination cards and choose their visual size to match the collage layout.',
      },
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          admin: { description: 'Starting price in INR' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          admin: { description: 'Optional link to destination page (e.g., /destinations/spain)' },
        },
        {
          name: 'size',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Large (hero)', value: 'large' },
            { label: 'Medium (wide)', value: 'medium' },
            { label: 'Small (compact)', value: 'small' },
          ],
        },
      ],
    },
  ],
}
