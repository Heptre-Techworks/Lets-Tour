
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function checkCategories() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- CHECKING PACKAGE CATEGORIES ---')
  
  const results = await payload.find({
    collection: 'package-categories',
    limit: 10,
  })

  console.log(`Total Categories found: ${results.totalDocs}`)
  if (results.totalDocs > 0) {
      console.log('Sample docs:', results.docs.map(d => d.name).join(', '))
  } else {
      console.log('Collection is empty.')
  }

  process.exit(0)
}

checkCategories()
