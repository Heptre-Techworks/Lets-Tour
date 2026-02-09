import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function analyzeMenuData() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- ANALYZING DESTINATIONS ---')
  const destinations = await payload.find({
    collection: 'destinations',
    limit: 100,
    depth: 2,
  })

  let internationalCount = 0
  let domesticCount = 0
  let missingType = 0
  let missingContinent = 0
  let missingCountry = 0
  let missingRegion = 0
  let idOnlyCountry = 0
  let idOnlyRegion = 0

  destinations.docs.forEach((d: any) => {
    if (!d.type) missingType++
    if (d.type === 'international') {
      internationalCount++
      if (!d.continent) {
        console.log(`❌ International Destination missing continent: ${d.name}`)
        missingContinent++
      }
      if (!d.country) {
         console.log(`❌ International Destination missing country: ${d.name}`)
         missingCountry++
      } else if (typeof d.country !== 'object') {
         console.log(`⚠️ International Destination country is ID only: ${d.name} (${d.country})`)
         idOnlyCountry++
      }
    }
    if (d.type === 'domestic') {
      domesticCount++
      if (!d.region) {
         console.log(`❌ Domestic Destination missing region: ${d.name}`)
         missingRegion++
      } else if (typeof d.region !== 'object') {
         console.log(`⚠️ Domestic Destination region is ID only: ${d.name} (${d.region})`)
         idOnlyRegion++
      }
    }
  })

  console.log('Summary Destinations:')
  console.log(`Total: ${destinations.docs.length}`)
  console.log(`International: ${internationalCount}`)
  console.log(`Domestic: ${domesticCount}`)
  console.log(`Missing Type: ${missingType}`)
  console.log(`Missing Continent (International): ${missingContinent}`)
  console.log(`Missing Country (International): ${missingCountry}`)
  console.log(`Country is ID only: ${idOnlyCountry}`)
  console.log(`Missing Region (Domestic): ${missingRegion}`)
  console.log(`Region is ID only: ${idOnlyRegion}`)


  console.log('\n--- ANALYZING PACKAGES ---')
  const packages = await payload.find({
    collection: 'packages',
    limit: 100,
    depth: 2,
    draft: true, // Check drafts too
  })

  if (packages.docs.length > 0) {
      console.log('DEBUG: First Package Dump:', JSON.stringify(packages.docs[0], null, 2))
  }

  let missingThemes = 0
  let idOnlyThemes = 0
  let missingDestinations = 0
  let idOnlyDestinations = 0

  packages.docs.forEach((p: any) => {
    if (!p.themes || p.themes.length === 0) {
      // console.log(`⚠️ Package missing themes: ${p.name}`)
      missingThemes++
    } else {
        if (typeof p.themes[0] !== 'object') {
             console.log(`⚠️ Package themes are ID only: ${p.name}`)
             idOnlyThemes++
        }
    }

    if (!p.destinations || p.destinations.length === 0) {
         // console.log(`⚠️ Package missing destinations: ${p.name}`)
         missingDestinations++
    } else {
        if (typeof p.destinations[0] !== 'object') {
            console.log(`⚠️ Package destinations are ID only: ${p.name}`)
            idOnlyDestinations++
        }
    }
  })

  console.log('Summary Packages:')
  console.log(`Total: ${packages.docs.length}`)
  console.log(`Missing/Empty Themes: ${missingThemes}`)
  console.log(`Themes are ID only: ${idOnlyThemes}`)
  console.log(`Missing/Empty Destinations: ${missingDestinations}`)
  console.log(`Destinations are ID only: ${idOnlyDestinations}`)

  process.exit(0)
}

analyzeMenuData()
