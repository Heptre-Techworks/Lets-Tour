import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Country } from '@/payload-types'

const migrate = async () => {
  const payload = await getPayload({ config: configPromise })

  console.log('Starting Country Data Migration...')

  const collections = ['destinations', 'international-package']

  for (const slug of collections) {
    console.log(`Processing collection: ${slug}`)
    
    // Fetch all docs
    const { docs } = await payload.find({
      collection: slug as any,
      limit: 1000,
      depth: 0,
    })

    for (const doc of docs) {
      if (typeof doc.country === 'string' && doc.country.trim().length > 0) {
         // Check if it's already an ID (roughly) - simplistic check
         // If it's a name like "India", we process it.
         // If it's a 24 char hex, it might be an ID, but let's assume names for now.
         
         const countryName = doc.country.trim()
         const countrySlug = countryName.toLowerCase().replace(/ /g, '-')

         // 1. Check if Country exists
         const existingCountries = await payload.find({
            collection: 'countries',
            where: {
                name: { equals: countryName }
            }
         })

         let countryID: string

         if (existingCountries.docs.length > 0) {
            countryID = existingCountries.docs[0].id
         } else {
             // Create it
             console.log(`Creating new Country: ${countryName}`)
             const newCountry = await payload.create({
                 collection: 'countries',
                 data: {
                     name: countryName,
                     continent: 'asia', // Defaulting to Asia, manual fixup might be needed later
                 }
             })
             countryID = newCountry.id
         }

         // 2. Update the doc with the ID
         // We update the 'country' field. Even though schema is 'text', storing an ID string is fine.
         // When we switch schema to relationship later, it will work.
         if (doc.country !== countryID) {
             console.log(`Updating ${slug} "${doc.name}" : "${doc.country}" -> ${countryID}`)
             await payload.update({
                 collection: slug as any,
                 id: doc.id,
                 data: {
                     country: countryID
                 },
                 context: {
                    disableRevalidate: true
                 }
             })
         }
      }
    }
  }
  
  console.log('Migration Complete.')
  process.exit(0)
}

migrate()
