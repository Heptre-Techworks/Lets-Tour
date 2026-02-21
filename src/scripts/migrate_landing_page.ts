import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const migrate = async () => {
  const payload = await getPayload({ config: configPromise })

  console.log('Starting Landing Page Data Migration...')

  try {
    // 1. Find the "home" page
    const { docs: pages } = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: 'home' },
      },
      limit: 1,
      depth: 0,
    })

    if (pages.length === 0) {
      console.log('Home page not found. Aborting.')
      process.exit(0)
    }

    const homePage = pages[0]

    // 2. Check if the home page has a hero
    if (!homePage.hero) {
      console.log('Home page does not have hero data. Aborting.')
      process.exit(0)
    }

    // 3. Update the LandingPage global
    console.log('Migrating hero data to LandingPage global...')
    
    // The LandingPage global expects the 'hero' field to match the hero object.
    await payload.updateGlobal({
      slug: 'landing-page',
      data: {
        hero: homePage.hero as Record<string, unknown>,
      },
    })

    console.log('Successfully migrated home page hero data to LandingPage global.')
  } catch (err) {
    console.error('Error during migration:', err)
  }

  process.exit(0)
}

migrate()
