// src/heroes/PackageHero/config.ts
import type { Field } from 'payload'

export const PackageHeroConfig: Field[] = [
  {
    name: 'packageHeroFields',
    label: 'Package Hero Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'packageHero',
      description: '⚡ Package will be auto-detected from URL slug',
    },
    fields: [
      {
        name: 'buttons',
        type: 'group',
        label: 'Button Configuration',
        fields: [
          {
            name: 'bookNowLabel',
            type: 'text',
            defaultValue: 'Book now',
          },
          {
            name: 'enableDownload',
            type: 'checkbox',
            label: 'Enable Download Button',
            defaultValue: true,
          },
        ],
      },
    ],
  },
]
