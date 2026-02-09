
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function debugLayout() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- FETCHING DESTINATION LAYOUT ---')
  
  const layout = await payload.findGlobal({
      slug: 'destinationLayout',
      depth: 2,
  })

  // @ts-ignore
  if (layout.layout) {
      // @ts-ignore
      layout.layout.forEach((block, index) => {
          console.log(`Block ${index}: Type=${block.blockType}`)
          if (block.blockType === 'dynamicScroller') {
              console.log('  - Sections:', block.sections?.length)
              block.sections?.forEach((sec: any, i: number) => {
                  console.log(`    - Section ${i}: ${sec.blockType || sec.blockName} (Populate: ${sec.populatePackagesBy || sec.populateDestinationsBy})`)
              })
          }
          if (block.title) console.log('  - Title:', block.title)
          // Print a snippet of items if they exist
          if (block.destinations) console.log(`  - Destinations: ${block.destinations.length}`)
          if (block.cards) console.log(`  - Cards: ${block.cards.length}`)
          if (block.items) console.log(`  - Items: ${block.items.length}`)
      })
  } else {
      console.log('No layout found.')
  }

  process.exit(0)
}

debugLayout()
