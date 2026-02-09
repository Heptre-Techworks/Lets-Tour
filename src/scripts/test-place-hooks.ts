
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function testPlaceHooks() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- TESTING PLACE HOOKS ---')
  
  // 1. Create a Place with lowercase name and NO slug
  // Expected: Name becomes "Test Place hooks", Slug becomes "test-place-hooks"
  const placeName = 'test place hooks ' + Date.now()
  
  try {
      // Need a dummy destination and city first?? 
      // I'll assume I can find one or just fail if relationships are required.
      // Places requires 'destination' and 'city'.
      
      const destination = await payload.find({ collection: 'destinations', limit: 1 })
      const city = await payload.find({ collection: 'cities', limit: 1 })
      const media = await payload.find({ collection: 'media', limit: 1 })

      if (destination.totalDocs === 0 || city.totalDocs === 0 || media.totalDocs === 0) {
          console.error('Skipping test: Missing required relationships (dest/city/media)')
          process.exit(0)
      }

      console.log(`Creating place with name: "${placeName}"`)

      const place = await payload.create({
          collection: 'places',
          data: {
              name: placeName,
              destination: destination.docs[0].id,
              city: city.docs[0].id,
              image: media.docs[0].id,
              shortDescription: { root: { children: [{ type: 'text', version: 1, text: 'Short desc' }], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } },
              // slug should be auto-generated
          }
      })

      console.log(`Created Place ID: ${place.id}`)
      console.log(`Name (Title Case?): "${place.name}"`)
      console.log(`Slug (Slugified?): "${place.slug}"`)

      if (place.name === 'Test Place Hooks ' + placeName.split(' ')[3] && place.slug) {
         console.log('✅ Hooks Working!')
      } else {
         console.log('❌ Hooks Failed matching expectations.')
      }

      // Cleanup
      await payload.delete({ collection: 'places', id: place.id })
      console.log('Cleaned up test place.')

  } catch (e) {
      console.error('Error testing hooks:', e)
  }

  process.exit(0)
}

testPlaceHooks()
