import type { Field } from 'payload'

export const PackageHeroConfig: Field[] = [
  {
    name: 'packageHeroFields',
    label: 'Package Hero Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'packageHero',
    },
    fields: [
      {
        name: 'packageName',
        type: 'text',
        label: 'Package Name',
        required: true,
      },
      {
        name: 'packageImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Package Image',
        required: true,
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        required: false,
      },
    ],
  },
]
