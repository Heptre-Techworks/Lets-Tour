// src/heroes/DestinationHero/config.ts
import type { Field } from 'payload'

export const DestinationHeroConfig: Field[] = [
  {
    name: 'destinationHeroFields',
    label: 'Destination Hero Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'destinationHero',
      description: '⚡ Destination will be auto-detected from URL slug',
    },
    fields: [
      {
        name: 'autoplayInterval',
        type: 'number',
        label: 'Autoplay Interval (milliseconds)',
        defaultValue: 5000,
        min: 2000,
        max: 10000,
        admin: {
          description: 'Time in milliseconds between automatic slide changes',
        },
      },
    ],
  },
]
