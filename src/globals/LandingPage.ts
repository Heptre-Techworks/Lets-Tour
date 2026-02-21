import type { GlobalConfig } from 'payload'
import { MainHeroConfig } from '@/heros/MainHero/config'

export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  label: 'Landing Page',
  admin: {
    group: 'Site Management', // This groups it with Pages
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Home Page Hero Settings',
      fields: [
        {
          name: 'type',
          type: 'text',
          defaultValue: 'mainHero',
          admin: {
            hidden: true, // Hide this since it's strictly the mainHero configuration
          },
        },
        ...MainHeroConfig,
      ],
    },
  ],
}
