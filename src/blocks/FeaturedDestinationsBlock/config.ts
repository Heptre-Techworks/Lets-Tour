import { Block } from 'payload'

export const FeaturedDestinationsBlock: Block = {
  slug: 'featuredDestinationsBlock',
  labels: {
    singular: 'Featured Destinations Block',
    plural: 'Featured Destinations Blocks'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Featured Destinations'
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend."
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations' as const,
      hasMany: true,
      maxRows: 8
    }
  ]
}
