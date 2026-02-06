// src/collections/international-package/index.ts
import type { CollectionConfig } from 'payload'
import {
  revalidateInternationalPackage,
  revalidateInternationalPackageDelete,
} from './hooks/revalidiateinternationalpackage'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const InternationalPackage: CollectionConfig = {
  slug: 'international-package',

  admin: {
    group: 'Trips & Packages',
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'isFeatured', 'isPopular', 'startingPrice'],

    description: 'Manage destination countries and their content',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Destination name (e.g., Spain, Indonesia)',
      },
    },
    ...slugField(),

    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Brief description for cards on homepage (max 200 characters)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full destination overview displayed on destination page',
      },
    },

    // ==================== IMAGES ====================
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Main image shown on homepage destination cards',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Hero banner image for destination page',
      },
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Additional images showcasing the destination',
      },
    },

    // ==================== HERO SECTION DATA ====================
    {
      name: 'heroData',
      type: 'group',
      label: 'Hero Section',
      admin: {
        description: 'Data for DestinationHero component',
      },
      fields: [
        {
          name: 'tagline',
          type: 'text',
          admin: {
            placeholder: 'To travel is to live!',
            description: 'Inspirational tagline shown on hero',
          },
        },
        {
          name: 'elevation',
          type: 'text',
          admin: {
            placeholder: '10,348 ft',
            description: 'Famous elevation/landmark (e.g., "Mount Everest 10,348 ft")',
          },
        },
        {
          name: 'heroBackgroundPattern',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional decorative pattern/overlay for hero',
          },
        },
      ],
    },

    // ==================== LOCATION DATA ====================
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      admin: {
        description: 'Broader geographical area (e.g., Europe, Asia)',
      },
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      admin: {
        description: 'Country (selected from list)',
      },
      required: true,
    },
    {
      name: 'continent',
      type: 'select',
      options: [
        { label: 'Asia', value: 'asia' },
        { label: 'Europe', value: 'europe' },
        { label: 'North America', value: 'north-america' },
        { label: 'South America', value: 'south-america' },
        { label: 'Africa', value: 'africa' },
        { label: 'Oceania', value: 'oceania' },
      ],
      admin: {
        description: 'Continent for filtering',
      },
    },
    {
      name: 'cities',
      type: 'relationship',
      relationTo: 'cities',
      hasMany: true,
      admin: {
        description: 'Cities within this destination (shown as tabs in hero)',
      },
    },
    {
      name: 'places',
      type: 'relationship',
      relationTo: 'places',
      hasMany: true,
      admin: {
        description: 'Tourist attractions for "Things to do" carousel',
      },
    },

    // ==================== PRICING ====================
    {
      type: 'row',
      fields: [
        {
          name: 'startingPrice',
          type: 'number',
          min: 0,
          admin: {
            width: '50%',
            description: 'Lowest package price',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: '₹ INR', value: 'INR' },
            { label: '$ USD', value: 'USD' },
            { label: '€ EUR', value: 'EUR' },
            { label: '£ GBP', value: 'GBP' },
          ],
          defaultValue: 'INR',
          admin: {
            width: '50%',
          },
        },
      ],
    },

    // ==================== DISCOUNT/OFFERS (for NonUniformCardCarousel) ====================
    {
      name: 'discount',
      type: 'group',
      label: 'Discount/Offers',
      admin: {
        description: 'Discount badge shown on destination cards',
      },
      fields: [
        {
          name: 'hasDiscount',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show Discount Badge',
        },
        {
          name: 'percentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.hasDiscount,
            description: 'Discount percentage (e.g., 10 for "10% Off")',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.hasDiscount,
            placeholder: '10% Off',
            description: 'Custom discount label',
          },
        },
      ],
    },

    // ==================== ADDITIONAL INFO (for cards) ====================
    {
      name: 'locationDetails',
      type: 'text',
      admin: {
        description:
          'Brief location description shown on cards (e.g., "Mediterranean coast, rich culture")',
      },
    },
    {
      name: 'packageCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated: number of packages for this destination',
      },
    },

    // ==================== CATEGORIZATION ====================
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in "Featured Destinations" homepage section',
      },
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Display "Popular" badge',
      },
    },
    {
      name: 'isInSeason',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in "In Season" section with badge',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Apply categories like "Family Friendly", "Adventure"',
      },
    },
    {
      name: 'themes',
      type: 'relationship',
      relationTo: 'themes',
      hasMany: true,
      admin: {
        description: 'Themes associated with this destination (e.g. Honeymoon, Adventure).',
      },
    },

    // ✅ NEW: VIBES FIELD (Temporarily commented until Vibes collection is created)
    {
      name: 'vibes',
      type: 'relationship',
      relationTo: 'vibes',
      hasMany: true,
      admin: {
        description: 'Destination vibes/moods (e.g., Outdoor, Relaxing, Glamping)',
      },
    },

    {
      name: 'popularityScore',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Higher score = more prominent placement',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Manual ordering (lower = appears first)',
      },
    },

    // ==================== HIGHLIGHTS ====================
    {
      name: 'highlights',
      type: 'array',
      labels: {
        singular: 'Highlight',
        plural: 'Highlights',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Key highlights/selling points',
      },
    },

    // ==================== METADATA ====================
    {
      name: 'bestTimeToVisit',
      type: 'text',
      admin: {
        placeholder: 'April - October',
        description: 'Best months to visit',
      },
    },
    {
      name: 'languages',
      type: 'text',
      admin: {
        placeholder: 'Spanish, English',
        description: 'Languages spoken',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      admin: {
        placeholder: 'Europe/Madrid',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: { width: '50%' },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: { width: '50%' },
        },
      ],
    },

    // ==================== PUBLISH STATUS ====================
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],

  hooks: {
    afterChange: [revalidateInternationalPackage],
    afterDelete: [revalidateInternationalPackageDelete],
  },
}
export default InternationalPackage
