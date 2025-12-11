// src/InternationalLayout/config.ts
import type { GlobalConfig } from 'payload'
import { hero } from '@/heros/config'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { DynamicScroller } from '@/blocks/DynamicScroller/config'
import { PopularNow } from '@/blocks/PopularNowBlock/config'
import { ClientStories } from '@/blocks/ClientStories/config'
import { UniformCardCarousel } from '@/blocks/UniformCardCarousel/config'
import { StaticImageBlock } from '@/blocks/StaticImageBlock/config'
import { NonUniformCardCarousel } from '@/blocks/NonUniformCardCarousel/config'
import { UpDownCardCarousel } from '@/blocks/UpDownCardCarousel/config'
import { DestinationHeroCarousel } from '@/blocks/DestinationHeroCarousel/config'
import InstagramCarouselBlock from '@/blocks/InstagramCarousel/config'
import { TravelPackageExplorer } from '@/blocks/TravelPackageExplorer/config'
import { PackageHighlights } from '@/blocks/PackageHighlights/config'
import { revalidateInternationalLayout } from './hooks/revalidateInternationalPackageLayout'
import { FeatureCarousel } from '@/blocks/FeatureCarousel/config'
import { ImageGrid } from '@/blocks/ImageGrid/config'
import InfoPanel from '@/blocks/InfoPanel/config'

export const DestinationLayout: GlobalConfig = {
  slug: 'internationallayout',
  label: 'international Layout',
  access: { read: () => true },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateInternationalLayout],
  },
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
                DynamicScroller,
                PopularNow,
                UniformCardCarousel,
                StaticImageBlock,
                NonUniformCardCarousel,
                UpDownCardCarousel,
                ClientStories,
                DestinationHeroCarousel,
                InstagramCarouselBlock,
                TravelPackageExplorer,
                PackageHighlights,
                FeatureCarousel,
                InfoPanel,
                ImageGrid,
              ],
              admin: { initCollapsed: true },
            },
          ],
        },
      ],
    },
  ],
}
