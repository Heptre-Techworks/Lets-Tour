import { Field } from 'payload'
import { MainHeroConfig } from './MainHero/config'
import { DestinationHeroConfig } from './DestinationHero/config'
import { PackageHeroConfig } from './PackageHero/config'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Hero Type',
      required: true,
      options: [
        { label: 'Main Hero', value: 'mainHero' },
        { label: 'Destination Hero', value: 'destinationHero' },
        { label: 'Package Hero', value: 'packageHero' },
      ],
      defaultValue: 'mainHero',
    },
    // Conditional fields for each hero type
    ...MainHeroConfig,
    ...DestinationHeroConfig,
    ...PackageHeroConfig,
  ],
}
