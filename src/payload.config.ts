// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { PackageCategories } from './collections/PackageCategories'
import { Destinations } from './collections/Destinations'
import { Packages } from './collections/Packages'
import { SearchFilters } from './collections/SearchFilters'
import { PackageLayout } from './PackageLayout/config'
import { DestinationLayout } from './DestinationLayout/config'
import { AccommodationTypes } from './collections/AccomodationTypes'
import { Activities } from './collections/Activities'
import { Amenities } from './collections/Amenities'
import { Bookings } from './collections/Bookings'
import { BulkBookingRequests } from './collections/BulkBookingRequests'
import { Cities } from './collections/Cities'
import { CustomTripRequests } from './collections/CustomTripRequests'
import { Exclusions } from './collections/Exclusions'
import { Favorites } from './collections/Favourites'
import { Inclusions } from './collections/Inclusions'
import { MarketingBanners } from './collections/MarketingBanners'
import { Places } from './collections/Places'
import { Promotions } from './collections/Promotions'
import Regions from './collections/Regions'
import { Reviews } from './collections/Reviews'
import { SocialPosts } from './collections/SocialPosts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    PackageCategories,
    Destinations,
    Packages,
    AccommodationTypes,
    Activities,
    Amenities,
    Bookings,
    BulkBookingRequests,
    Cities,
    CustomTripRequests,
    Exclusions,
    Favorites,
    Inclusions,
    MarketingBanners,
    Places,
    Promotions,
    Regions,
    Reviews,
    SocialPosts,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SearchFilters, PackageLayout, DestinationLayout],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Add onInit hook to create admin user if none exist
  onInit: async (payload) => {
    try {
      // Check if any users exist in the Users collection
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1,
      })

      // If no users exist, create a default admin user
      if (existingUsers.docs.length === 0) {
        console.log('No users found. Creating default admin user...')
        
        await payload.create({
          collection: 'users',
          data: {
            name: 'Admin',
            email: 'admin@letstour.com',
            password: 'admin123', // Payload automatically hashes this password
            role: 'admin',
          },
        })

        console.log('✅ Default admin user created successfully!')
        console.log('📧 Email: admin@letstour.com')
        console.log('🔑 Password: admin123')
        console.log('⚠️  Please change the password after first login')
      } else {
        console.log(`✅ Found ${existingUsers.docs.length} existing user(s)`)
      }
    } catch (error) {
      console.error('❌ Error during user initialization:', error)
    }
  }, // onInit hook runs when Payload initializes [web:198][web:3]
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
