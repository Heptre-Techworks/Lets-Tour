import type { Block } from 'payload'

export const AccreditationsGrid: Block = {
  slug: 'accreditationsGrid',
  interfaceName: 'AccreditationsGridBlock',
  labels: {
    singular: 'Accreditations Grid',
    plural: 'Accreditations Grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Our Accreditations',
      label: 'Heading',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
