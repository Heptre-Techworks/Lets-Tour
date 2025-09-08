import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { FeaturedDestinationsBlock } from '@/blocks/FeaturedDestinationsBlock/Component'
import { PopularNowBlock } from '@/blocks/PopularNowBlock/Component'
import {EnlargingCardCarousel} from './EnlargingCardCarousel/Component'
import {UniformCardCarousel} from '@/blocks/UniformCardCarousel/Component'
import StaticImageBlock from '@/blocks/StaticImageBlock/Component'
import NonUniformCardCarousel from '@/blocks/NonUniformCardCarousel/Component'
import UpDownCardCarousel from './UpDownCardCarousel/Component'
import HeroMainBlock from '@/blocks/HeroMainBlock/Component'
import DestinationHeroCarousel from './DestinationHeroCarousel/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  featuredDestinationsBlock: FeaturedDestinationsBlock,
  popularNowBlock: PopularNowBlock,
  uniformCardCarousel: UniformCardCarousel,
  staticImageBlock: StaticImageBlock,
  nonUniformCardCarousel: NonUniformCardCarousel,
  upDownCardCarousel:UpDownCardCarousel,
  heroMainBlock: HeroMainBlock,
  enlargingCardCarousel:EnlargingCardCarousel,
  destinationHeroCarousel: DestinationHeroCarousel,
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
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
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
