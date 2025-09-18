// payload/configs/DestinationHeroConfig.ts
import type { Field } from 'payload'

export const DestinationHeroConfig: Field[] = [
  {
    name: 'destinationHeroFields',
    label: 'Destination Hero Fields',
    type: 'group',
    admin: {
      // render this group only when the hero type is destinationHero
      condition: (_, siblingData) => siblingData?.type === 'destinationHero',
    },
    fields: [
      {
        name: 'destination',
        type: 'relationship',
        relationTo: 'destinations',
        required: true,
        maxDepth: 1, // keep REST depth small; component can request more if needed
      },
      {
        name: 'presentation',
        type: 'group',
        fields: [
          { name: 'overlay', type: 'number', label: 'Dark overlay (0–1)', defaultValue: 0.35 },
          { name: 'showArrows', type: 'checkbox', label: 'Show arrows', defaultValue: true },
          {
            name: 'titleOverride',
            type: 'text',
            label: 'Optional title text',
            admin: { description: 'Defaults to destination.name if left empty' },
          },
        ],
      },
    ],
  },
]
