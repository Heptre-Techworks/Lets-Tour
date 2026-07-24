// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

// import { s3Storage } from '@payloadcms/storage-s3' // NEW
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { ThemeSettings } from './globals/ThemeSettings'
import { LandingPage } from './globals/LandingPage'
import { PaymentSettings } from './globals/PaymentSettings'

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
import { PackageDepartures } from './collections/PackageDepartures'
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
import { Themes } from './collections/Themes'
import { Countries } from './collections/Countries'
import { autoRevalidatePlugin } from './plugins/autoValidate'
import TravelDashboard from './components/Admin/TravelDashboard'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      afterNavLinks: [
        '@/components/Admin/PackageManager/PackageManagerNavLink#PackageManagerNavLink',
      ],
      views: {
        // @ts-ignore
        Dashboard: TravelDashboard,
        packageManager: {
          Component: '@/components/Admin/PackageManager/PackageManagerView#PackageManagerView',
          path: '/package-manager',
        },
      },
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
    url: process.env.MONGODB_URI || '',
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
    PackageDepartures,
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
    Themes,
    Countries,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, ThemeSettings, SearchFilters, PackageLayout, DestinationLayout, LandingPage, PaymentSettings],
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
  email: nodemailerAdapter({
    defaultFromAddress: process.env.ZOHO_USER || 'admin@example.com',
    defaultFromName: 'Lets Tour',
    transportOptions: {
      host: process.env.SMTP_HOST || 'smtppro.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    },
  }),
  onInit: async (payload) => {
    try {
      const existingUsers = await payload.find({
        collection: 'users',
        limit: 1,
      })

      if (existingUsers.docs.length === 0) {
        // Seed the first admin only from env — never hard-code credentials.
        const seedEmail = process.env.INITIAL_ADMIN_EMAIL
        const seedPassword = process.env.INITIAL_ADMIN_PASSWORD

        if (seedEmail && seedPassword) {
          console.log('No users found. Creating initial admin user from env...')
          await payload.create({
            collection: 'users',
            data: {
              name: 'Admin',
              email: seedEmail,
              password: seedPassword,
              role: 'admin',
            },
          })
          console.log(`✅ Initial admin user created: ${seedEmail}`)
          console.log('⚠️  Please change the password after first login')
        } else {
          console.log(
            '⚠️  No users found and INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD not set. ' +
              'Skipping seed — create the first admin via /admin.',
          )
        }
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
