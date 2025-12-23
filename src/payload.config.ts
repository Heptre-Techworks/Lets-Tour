// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'

// import { s3Storage } from '@payloadcms/storage-s3' // NEW
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

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
import { InternationalPackage } from './collections/InternationalPackage'
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
import Vibes from './collections/Vibes'
import { autoRevalidatePlugin } from './plugins/autoValidate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
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
    InternationalPackage,
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
    Vibes,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SearchFilters, PackageLayout, DestinationLayout],
  plugins: [
    ...plugins,
    autoRevalidatePlugin,

    // S3 Storage for Payload (v3) — map collection slugs to S3
    // s3Storage({
    //   collections: {
    //     // MUST equal your upload-enabled collection slug ("media" here)
    //     media: true,
    //     // You can add more upload collections here or pass per-collection options, e.g.:
    //     // documents: { prefix: 'docs/' },
    //     // mediaWithPresigned: {
    //     //   signedDownloads: {
    //     //     shouldUseSignedURL: ({ filename }) => filename.endsWith('.mp4'),
    //     //   },
    //     // },
    //   },
    //   bucket: process.env.S3_BUCKET as string,
    //   config: {
    //     region: process.env.S3_REGION as string,
    //     credentials: {
    //       accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    //       secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    //     },
    //     // For S3‑compatible providers only:
    //     // endpoint: process.env.S3_ENDPOINT,
    //     // forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    //   },
    //   // Global toggles you can enable if needed:
    //   // clientUploads: true, // direct browser uploads (allow CORS PUT on bucket)
    //   // signedDownloads: true, // presigned GETs while preserving access control
    // }),
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true, // Maps to your Media collection slug
      },
      // Ensure this token is in your .env
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  onInit: async (payload) => {
    try {
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1,
      })

      if (existingUsers.docs.length === 0) {
        console.log('No users found. Creating default admin user...')
        await payload.create({
          collection: 'users',
          data: {
            name: 'Admin',
            email: 'admin@letstour.com',
            password: 'admin123',
            role: 'admin',
          },
        })
        await payload.create({
          collection: 'users',
          data: {
            name: 'user',
            email: 'dhanushkumark62@gmail.com',
            password: '123456789',
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
  }, // onInit hook runs when Payload initializes
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
