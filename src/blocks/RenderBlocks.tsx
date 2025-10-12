import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { DynamicScrollerBlockComponent } from './DynamicScroller/Component'
import { PopularNow } from '@/blocks/PopularNowBlock/Component'
import { ClientStories } from '@/blocks/ClientStories/Component'
import {UniformCardCarousel} from '@/blocks/UniformCardCarousel/Component'
import StaticImageBlock from '@/blocks/StaticImageBlock/Component'
import NonUniformCardCarousel from '@/blocks/NonUniformCardCarousel/Component'
import UpDownCardCarousel from './UpDownCardCarousel/Component'
import DestinationHeroCarousel from './DestinationHeroCarousel/Component'
import { InstagramCarousel } from './InstagramCarousel/Component'
import ImageGrid from './ImageGrid/Component'
import { TravelPackageExplorer } from '@/blocks/TravelPackageExplorer/Component'
import { PackageHighlights} from '@/blocks/PackageHighlights/Component'
import {FeatureCarousel} from '@/blocks/FeatureCarousel/Component'
import {HeaderPoints} from '@/blocks/HeaderPoints/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  dynamicScroller:DynamicScrollerBlockComponent,
  popularNow: PopularNow,
  uniformCardCarousel: UniformCardCarousel,
  staticImageBlock: StaticImageBlock,
  nonUniformCardCarousel: NonUniformCardCarousel,
  upDownCardCarousel:UpDownCardCarousel,
  clientStories: ClientStories,
  destinationHeroCarousel: DestinationHeroCarousel,
  instagramCarousel: InstagramCarousel,
  imageGrid: ImageGrid,
  travelPackageExplorer: TravelPackageExplorer,
  packageHighlights: PackageHighlights,
  featureCarousel: FeatureCarousel,
  headerPoints: HeaderPoints
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {}
                  <Block {...(block as any)} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
