
import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const THEMES_TO_CREATE = [
  'Honeymoon',
  'Adventure',
  'Family',
  'Group Tours',
  'Nature',
  'Cultural',
  'Religious' 
]

async function fixMenuData() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- STARTING DATA FIX ---')

  // 1. Create Themes if they don't exist
  const themeMap = new Map<string, string>() // Name -> ID
  
  for (const themeName of THEMES_TO_CREATE) {
      const existing = await payload.find({
          collection: 'themes',
          where: { name: { equals: themeName } },
          limit: 1
      })

      if (existing.docs.length > 0) {
          themeMap.set(themeName, existing.docs[0].id)
          console.log(`✅ Theme exists: ${themeName}`)
      } else {
          const newTheme = await payload.create({
              collection: 'themes',
              data: { name: themeName }
          })
          themeMap.set(themeName, newTheme.id)
          console.log(`✨ Created Theme: ${themeName}`)
      }
  }

  // 2. Fix Bali (Destination)
  const bali = await payload.find({
      collection: 'destinations',
      where: { name: { equals: 'Bali' } },
      limit: 1
  })

  // We need a country for Bali. Using "India" temporarily if Indonesia doesn't exist, 
  // OR creating Indonesia. Let's create Indonesia if missing.
  let indonesiaId = ''
  const indonesia = await payload.find({
      collection: 'countries',
      where: { name: { equals: 'Indonesia' } },
      limit: 1
  })
  if (indonesia.docs.length > 0) {
      indonesiaId = indonesia.docs[0].id
  } else {
      const newCountry = await payload.create({
          collection: 'countries',
          data: { 
              name: 'Indonesia',
              continent: 'asia',
          },
          req: { user: undefined } // mitigate auth/context issues
      })
      indonesiaId = newCountry.id
      console.log(`✨ Created Country: Indonesia`)
  }

  if (bali.docs.length > 0) {
      const b = bali.docs[0]
      if (!b.continent || !b.country) {
          try {
            await payload.update({
                collection: 'destinations',
                id: b.id,
                data: {
                    continent: 'asia',
                    country: indonesiaId,
                    region: null // clear region
                },
                context: { 
                    disableRevalidate: true,
                    skipRevalidation: true 
                },
            })
            console.log(`✅ Fixed Bali Data`)
          } catch (e: any) {
              console.log('Error updating Bali (ignoring if just revalidate):', e.message)
          }
      } else {
          console.log(`👍 Bali already has data`)
      }
  }

  // 3. Assign Themes to Packages
  const packages = await payload.find({
      collection: 'packages',
      limit: 1000,
      depth: 0
  })

  for (const pkg of packages.docs) {
      const name = pkg.name.toLowerCase()
      const themesToAdd = new Set<string>()

      if (name.includes('honeymoon') || name.includes('couple')) themesToAdd.add(themeMap.get('Honeymoon')!)
      if (name.includes('adventure') || name.includes('trek')) themesToAdd.add(themeMap.get('Adventure')!)
      if (name.includes('family')) themesToAdd.add(themeMap.get('Family')!)
      if (name.includes('group')) themesToAdd.add(themeMap.get('Group Tours')!)
      if (name.includes('kerala') || name.includes('munnar') || name.includes('nature')) themesToAdd.add(themeMap.get('Nature')!)
      
      // Default fallback if no match
      if (themesToAdd.size === 0) {
          themesToAdd.add(themeMap.get('Group Tours')!)
      }

      // Convert Set to Array
      const themeIds = Array.from(themesToAdd).filter(Boolean)

      if (themeIds.length > 0) {
         const currentThemes = pkg.themes || []
         // @ts-ignore
         const currentThemeIds = currentThemes.map(t => (t && typeof t === 'object' && 'id' in t) ? t.id : t).filter(Boolean)
         
         const isDifferent = themeIds.length !== currentThemeIds.length || themeIds.some(id => !currentThemeIds.includes(id))

         if (isDifferent) {
             try {
                await payload.update({
                    collection: 'packages',
                    id: pkg.id,
                    data: {
                        themes: themeIds,
                    },
                    context: { 
                        disableRevalidate: true,
                        skipRevalidation: true 
                    },
                    req: { user: undefined } 
                })
                console.log(`✅ Updated Package: ${pkg.name}`)
             } catch (e: any) {
                 console.log(`Error updating package ${pkg.name}:`, e.message)
             }
         }
      }
  }

  console.log('--- FIX COMPLETE ---')
  process.exit(0)
}

fixMenuData()
