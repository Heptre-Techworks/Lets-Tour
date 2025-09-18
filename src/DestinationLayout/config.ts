// src/DestinationLayout/config.ts
import type { GlobalConfig } from 'payload'
import { hero } from '@/heros/config'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { FeaturedDestinationsBlock } from '@/blocks/FeaturedDestinationsBlock/config'
import { PopularNowBlock } from '@/blocks/PopularNowBlock/config'
import { EnlargingCardCarousel } from '@/blocks/EnlargingCardCarousel/config'
import { UniformCardCarousel } from '@/blocks/UniformCardCarousel/config'
import { StaticImageBlock } from '@/blocks/StaticImageBlock/config'
import { NonUniformCardCarousel } from '@/blocks/NonUniformCardCarousel/config'
import { UpDownCardCarousel } from '@/blocks/UpDownCardCarousel/config'
import { HeroMainBlock } from '@/blocks/HeroMainBlock/config'
import { DestinationHeroCarousel } from '@/blocks/DestinationHeroCarousel/config'
import InstagramCarouselBlock from '@/blocks/InstagramCarousel/config'

export const DestinationLayout: GlobalConfig = {
  slug: 'destinationLayout',
  label: 'Destination Layout',
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'Hero', fields: [hero] },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              label: 'Layout',
              type: 'blocks',
              required: true,
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                FeaturedDestinationsBlock,
                PopularNowBlock,
                UniformCardCarousel,
                StaticImageBlock,
                NonUniformCardCarousel,
                HeroMainBlock,
                UpDownCardCarousel,
                EnlargingCardCarousel,
                DestinationHeroCarousel,
                InstagramCarouselBlock,
              ],
              admin: { initCollapsed: true },
            },
          ],
        },
      ],
    },
  ],
}
