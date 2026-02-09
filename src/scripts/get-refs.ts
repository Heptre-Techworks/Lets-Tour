
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function listReferenceData() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- THEMES ---')
  const themes = await payload.find({
    collection: 'themes',
    limit: 100,
  })
  themes.docs.forEach((t: any) => console.log(`Theme: ${t.name} (ID: ${t.id})`))

  console.log('\n--- COUNTRIES ---')
  const countries = await payload.find({
    collection: 'countries',
    limit: 100,
  })
  countries.docs.forEach((c: any) => console.log(`Country: ${c.name} (ID: ${c.id})`))

  console.log('\n--- DESTINATIONS (Target: Bali) ---')
  const bali = await payload.find({
    collection: 'destinations',
    where: { name: { equals: 'Bali' } },
  })
  if (bali.docs.length) {
      console.log(`Bali ID: ${bali.docs[0].id}`)
  } else {
      console.log('Bali not found')
  }

  process.exit(0)
}

listReferenceData()
