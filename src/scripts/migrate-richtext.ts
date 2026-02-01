import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load env before importing Payload config
dotenv.config({ 
  path: path.resolve(dirname, '../../.env') 
})

const migrate = async () => {
  // Dynamic imports to ensure env vars are loaded first
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../payload.config')

  const payload = await getPayload({ config: configPromise })

  console.log('🚀 Starting Migration...')

  const collections = ['destinations', 'packages', 'places', 'cities', 'regions', 'inclusions', 'exclusions', 'pages'] as const
  
  // Map collection to fields
  const fieldMap: Record<string, string[]> = {
    destinations: ['shortDescription'],
    packages: ['overview'], // itinerary is special case
    places: ['shortDescription'],
    cities: ['description'],
    regions: ['description'],
    inclusions: ['description'],
    exclusions: ['description'],
  }

  const convertToLexical = (text: string) => ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [{
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{
          mode: 'normal',
          text,
          type: 'text',
          style: '',
          detail: 0,
          format: 0,
          version: 1,
        }],
      }],
      direction: 'ltr',
    },
  })

  // Start Migration
  for (const slug of collections) {
    console.log(`\n📦 Migrating Collection: ${slug}`)
    
    // Fetch all docs
    const docs = await payload.find({
      collection: slug,
      limit: 1000,
      depth: 0,
    })

    console.log(`Found ${docs.totalDocs} documents`)

    for (const doc of docs.docs) {
      const updateData: any = {}
      let hasChange = false

      // 1. Handle Standard Fields
      const fields = fieldMap[slug] || []
      for (const field of fields) {
        const value = (doc as any)[field]
        if (typeof value === 'string' && value.trim().length > 0) {
          console.log(`   📝 Converting field '${field}' for doc ID: ${doc.id}`)
          updateData[field] = convertToLexical(value)
          hasChange = true
        }
      }

      // 2. Handle Special Case: Packages Itinerary
      if (slug === 'packages' && (doc as any).itinerary) {
        const itinerary = (doc as any).itinerary
        if (Array.isArray(itinerary)) {
           const newItinerary = itinerary.map((day: any) => {
             // Check if description is string
             if (typeof day.description === 'string' && day.description.trim().length > 0) {
               hasChange = true
               return {
                 ...day,
                 description: convertToLexical(day.description)
               }
             }
             return day
           })
           
           if (hasChange) {
             console.log(`   📝 Converting itinerary descriptions for doc ID: ${doc.id}`)
             updateData.itinerary = newItinerary
           }
        }
      }

      // 3. Handle Special Case: Pages InfoPanel Blocks (layout)
      if (slug === 'pages' && (doc as any).layout) {
        const layout = (doc as any).layout
        if (Array.isArray(layout)) {
          let layoutChanged = false
          const newLayout = layout.map((block: any) => {
            if (block.blockType === 'infoPanel') {
              let blockChanged = false
              const newBlock = { ...block }

              // Convert subheading
              if (newBlock.dataSource === 'manual' && typeof newBlock.subheading === 'string' && newBlock.subheading.trim().length > 0) {
                newBlock.subheading = convertToLexical(newBlock.subheading)
                blockChanged = true
              }

              // Convert items
              if (newBlock.dataSource === 'manual' && Array.isArray(newBlock.items)) {
                const newItems = newBlock.items.map((item: any) => {
                  if (typeof item.text === 'string' && item.text.trim().length > 0) {
                    blockChanged = true
                    return { ...item, text: convertToLexical(item.text) }
                  }
                  return item
                })
                if (blockChanged) {
                  newBlock.items = newItems
                }
              }

              if (blockChanged) {
                layoutChanged = true
                return newBlock
              }
            }
            return block
          })

          if (layoutChanged) {
            hasChange = true
            updateData.layout = newLayout
            console.log(`   📝 Converting InfoPanel blocks for page ID: ${doc.id}`)
          }
        }
      }

      if (hasChange) {
        try {
          await payload.update({
             collection: slug,
             id: doc.id,
             data: updateData,
             context: { skipRevalidation: true, disableRevalidate: true }
          })
          console.log(`   ✅ Updated ${doc.id}`)
        } catch (e) {
          console.error(`   ❌ Failed to update ${doc.id}`, e)
        }
      }
    }
  }

  console.log('\n✨ Migration Complete!')
  process.exit(0)
}

migrate()
