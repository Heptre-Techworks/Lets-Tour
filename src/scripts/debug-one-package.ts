
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function debugPackage() {
  const payload = await getPayload({ config: configPromise })

  const name = 'Wayanad Adventure Tour'
  console.log(`--- DEBUGGING PACKAGE: ${name} ---`)

  const results = await payload.find({
    collection: 'packages',
    where: { name: { equals: name } },
    draft: true,
    depth: 0, 
  })

  if (results.docs.length === 0) {
      console.log('Package not found')
      process.exit(0)
  }

  const pkg = results.docs[0]
  console.log('ID:', pkg.id)
  console.log('Themes:', pkg.themes)
  
  // Check if themes exist in DB
  if (pkg.themes && Array.isArray(pkg.themes)) {
      console.log('Themes count:', pkg.themes.length)
      if (pkg.themes.length > 0) {
          // @ts-ignore
          console.log('Theme 1 ID:', typeof pkg.themes[0] === 'object' ? pkg.themes[0].id : pkg.themes[0])
      }
  } else {
      console.log('Themes field is missing or empty')
  }

  process.exit(0)
}

debugPackage()
