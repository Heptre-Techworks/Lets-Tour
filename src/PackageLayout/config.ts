// src/PackageLayout/config.ts
import type { GlobalConfig } from 'payload'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'           // Or `{ Form }` if that’s the export
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

export const PackageLayout: GlobalConfig = {
  slug: 'packageLayout',
  label: 'Package Layout',
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    {
      name: 'layout',
      label: 'Layout',
      type: 'blocks',
      blocks: [
        Archive,
        Content,
        CallToAction,
        FormBlock,                 // Or `Form`
        MediaBlock,
        FeaturedDestinationsBlock,
        PopularNowBlock,
        UniformCardCarousel,
        StaticImageBlock,
        NonUniformCardCarousel,
        UpDownCardCarousel,
        HeroMainBlock,
        EnlargingCardCarousel,
        DestinationHeroCarousel,
      ],
      required: true,
    },
  ],
}
