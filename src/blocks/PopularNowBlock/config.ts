// payload/blocks/PopularNowBlock.ts
import type { Block } from 'payload'

export const PopularNowBlock: Block = {
  slug: 'popularNowBlock',
  labels: { singular: 'Popular Now Block', plural: 'Popular Now Blocks' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Popular now!' },
    { name: 'subtitle', type: 'text', defaultValue: "Today's enemy is tomorrow's friend." },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      required: true,
      admin: {
        description: 'Select destinations; the order chosen here is preserved on the page.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      min: 1,
      defaultValue: 12,
      admin: { description: 'Maximum number of destinations to render.' },
    },
  ],
}
export default PopularNowBlock
