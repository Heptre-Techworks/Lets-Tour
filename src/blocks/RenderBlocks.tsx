// src/blocks/RenderBlocks.tsx
import React, { Fragment } from 'react'
import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { DynamicScrollerBlockComponent } from '@/blocks/DynamicScroller/Component'
import { PopularNow } from '@/blocks/PopularNowBlock/Component'
import { ClientStories } from '@/blocks/ClientStories/Component'
import { UniformCardCarousel } from '@/blocks/UniformCardCarousel/Component'
import StaticImageBlock from '@/blocks/StaticImageBlock/Component'
import NonUniformCardCarousel from '@/blocks/NonUniformCardCarousel/Component'
import UpDownCardCarousel from './UpDownCardCarousel/Component'
import DestinationHeroCarousel from './DestinationHeroCarousel/Component'
import { InstagramCarousel } from './InstagramCarousel/Component'
import ImageGrid from './ImageGrid/Component'
import { TravelPackageExplorer } from '@/blocks/TravelPackageExplorer/Component'
import { PackageHighlights } from '@/blocks/PackageHighlights/Component'
import { FeatureCarousel } from '@/blocks/FeatureCarousel/Component'
import { InfoPanel } from '@/blocks/InfoPanel/Component'
import DynamicForm from './DynamicForm/Component'
import { AccreditationsGrid } from './AccreditationsGrid/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  dynamicScroller: DynamicScrollerBlockComponent,
  popularNow: PopularNow,
  uniformCardCarousel: UniformCardCarousel,
  staticImageBlock: StaticImageBlock,
  nonUniformCardCarousel: NonUniformCardCarousel,
  upDownCardCarousel: UpDownCardCarousel,
  clientStories: ClientStories,
  destinationHeroCarousel: DestinationHeroCarousel,
  instagramCarousel: InstagramCarousel,
  imageGrid: ImageGrid,
  travelPackageExplorer: TravelPackageExplorer,
  packageHighlights: PackageHighlights,
  featureCarousel: FeatureCarousel,
  dynamicForm: DynamicForm,
  infoPanel: InfoPanel,
  accreditationsGrid: AccreditationsGrid,
}

// ✅ Helper to serialize block data safely
function serializeBlockData(block: any) {
  // Remove non-serializable fields
  const { blockType, ...rest } = block

  // Convert any complex objects to plain data
  const serialized: any = { blockType }

  for (const key in rest) {
    const value = rest[key]

    // Skip functions
    if (typeof value === 'function') continue

    // ✅ Special handling for blocks fields (sections, items, etc.)
    if (key === 'sections' || key === 'items') {
      if (Array.isArray(value)) {
        // Keep the full block object structure for nested blocks
        serialized[key] = value.map((item) => {
          if (typeof item === 'object' && item !== null) {
            // Recursively serialize nested blocks
            return serializeBlockData(item)
          }
          return item
        })
        continue
      }
    }

    // Handle relationships - only keep id and basic fields
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        serialized[key] = value.map((item) => {
          if (typeof item === 'object' && item !== null) {
            // ✅ Check if it's a block (has blockType)
            if (item.blockType) {
              return serializeBlockData(item)
            }
            // For media/relationship objects, simplify
            return {
              id: item.id,
              url: item.url,
              alt: item.alt,
              name: item.name,
              slug: item.slug,
              filename: item.filename,
              mimeType: item.mimeType,
              width: item.width,
              height: item.height,
            }
          }
          return item
        })
      } else if (value.blockType) {
        // ✅ Nested block object
        serialized[key] = serializeBlockData(value)
      } else if (value.id) {
        // Single relationship
        serialized[key] = {
          id: value.id,
          url: value.url,
          alt: value.alt,
          name: value.name,
          slug: value.slug,
          filename: value.filename,
        }
      } else if ('root' in value) {
        // ✅ Preserve Lexical Rich Text objects
        serialized[key] = value
      } else {
        // Plain object (like theme, navigation, etc.)
        serialized[key] = value
      }
    } else {
      // Primitive values (string, number, boolean, null)
      serialized[key] = value
    }
  }

  return serialized
}

export const RenderBlocks: React.FC<{
  blocks: any[]
  packageContext?: any // Pass the full package object
  destinationContext?: any // Pass the full destination object
  slug?: string // Current page slug
}> = (props) => {
  const { blocks, packageContext, destinationContext, slug } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              // ✅ Serialize block data before passing to client component
              const serializedBlock = serializeBlockData(block)

              // ✅ Inject Package Context if available and block is context-aware
              if (packageContext) {
                 if (blockType === 'packageHighlights' || 
                     blockType === 'infoPanel') {
                    
                    // override dataSource if it was set to 'auto' or even if we just want to force it
                    // usually 'auto' is the trigger for dynamic content
                    if (serializedBlock.dataSource === 'auto' || !serializedBlock.dataSource) {
                        serializedBlock.dataSource = 'package'
                        serializedBlock.package = packageContext
                    }
                 }
              }

              // ✅ Inject Destination Context if available
              if (destinationContext) {
                  if (blockType === 'destinationHeroCarousel') {
                      // Force population by destination if we are on a destination page and it's set to auto
                      if (serializedBlock.populateBy === 'auto') {
                          serializedBlock.populateBy = 'destination'
                          serializedBlock.destination = destinationContext
                      }
                  }
                  if (blockType === 'dynamicScroller') {
                      serializedBlock.destinationContext = destinationContext
                  }
              }

              // ✅ Inject Slug if available (for TravelPackageExplorer auto-mode)
              if (slug) {
                  if (blockType === 'travelPackageExplorer') {
                      serializedBlock.slug = slug
                  }
                  // Also inject into DestinationHero if it needs slug for title interpolation
                  if (blockType === 'destinationHeroCarousel') {
                      serializedBlock.slug = slug 
                  }
              }

              return (
                <div key={index}>
                  <Block {...serializedBlock} disableInnerContainer />
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
