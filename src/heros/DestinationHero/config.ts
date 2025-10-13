import type { Field } from 'payload'

export const DestinationHeroConfig: Field[] = [
  {
    name: 'destinationHeroFields',
    label: 'Destination Hero Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'destinationHero',
    },
    fields: [
      {
        name: 'cities',
        type: 'array',
        label: 'Cities',
        required: true,
        minRows: 3,
        maxRows: 20,
        labels: {
          singular: 'City',
          plural: 'Cities',
        },
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'City Name',
            required: true,
          },
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'City Background Image',
            required: true,
            admin: {
              description: 'High-resolution image for the city background',
            },
          },
        ],
        admin: {
          initCollapsed: true,
          // components: {
          //   RowLabel: '@/heros/DestinationHero/RowLabel#CityRowLabel',
          // },
        },
      },
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
