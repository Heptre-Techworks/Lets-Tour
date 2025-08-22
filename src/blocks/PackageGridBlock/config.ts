import { Block } from 'payload'

export const PackageGridBlock: Block = {
  slug: 'packageGridBlock',
  labels: {
    singular: 'Package Grid Block',
    plural: 'Package Grid Blocks'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Popular Packages'
    },
    {
      name: 'subtitle',
      type: 'text'
    },
    {
      name: 'packages',
      type: 'relationship',
      relationTo: 'packages' as const,
      hasMany: true,
      maxRows: 12
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Grid 3 Columns', value: 'grid-3' },
        { label: 'Grid 4 Columns', value: 'grid-4' },
        { label: 'Carousel', value: 'carousel' }
      ],
      defaultValue: 'grid-3'
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true
    }
  ]
}
