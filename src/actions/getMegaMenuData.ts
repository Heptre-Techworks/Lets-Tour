'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function getMegaMenuData() {
  const payload = await getPayload({ config: configPromise })

  return unstable_cache(
    async () => {
      const [destinations, packages] = await Promise.all([
        payload.find({
          collection: 'destinations',
          where: {
            isPublished: { equals: true },
          },
          pagination: false,
          depth: 2,
             select: {
                slug: true,
                name: true,
                featuredImage: true,
                country: true,
                region: true,
                type: true,
                continent: true,
             }
         }),
         payload.find({
             collection: 'packages',
             where: {
                 isPublished: { equals: true },
             },
             pagination: false,
             depth: 2,
             select: {
                slug: true,
                name: true,
                destinations: true,
                themes: true,
                Summary: true,
                heroImage: true,
             }
         }),
      ])

      return {
        destinations: destinations.docs,
        packages: packages.docs, // Changing to categories per Navigation.tsx logic, or keep as packages if MegaMenu expects packages?
        // Checking MegaMenu logic: it seems to expect packages.
        // Let's re-read MegaMenu.tsx to be sure what it renders.
      }
    },
    ['mega-menu-data'],
    { tags: ['destinations', 'packages', 'package-categories'] }
  )()
}
