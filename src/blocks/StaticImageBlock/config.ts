// payload/blocks/StaticImageBlock.ts
import type { Block } from 'payload'

export const StaticImageBlock: Block = {
  slug: 'staticImageBlock',
  labels: {
    singular: 'Static Image Block',
    plural: 'Static Image Blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Background image for the block',
      },
    },
    {
      name: 'overlay',
      type: 'checkbox',
      label: 'Show dark overlay',
      defaultValue: true,
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small (300px)', value: 'small' },
        { label: 'Medium (400px)', value: 'medium' },
        { label: 'Large (500px)', value: 'large' },
        { label: 'Extra Large (600px)', value: 'xl' },
      ],
      admin: {
        description: 'Height of the image block',
      },
    },
  ],
}
