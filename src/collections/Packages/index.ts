// src/collections/Packages/index.ts
import type { CollectionConfig } from 'payload'
import { revalidatePackage, revalidatePackageDelete } from './hooks/revalidatePackage'
import { slugField } from '@/fields/slug'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidateSite'

export const Packages: CollectionConfig = {
  slug: 'packages',

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'isPublished'],
    group: 'Travel Management',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        // ==================== TAB 1: OVERVIEW ====================
        {
          label: 'Overview',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Package name (e.g., "Spanish Escape")',
              },
            },
            ...slugField(),
            {
              name: 'overview',
              type: 'richText',
              required: true,
              admin: {
                description: 'Brief overview of the package',
              },
            },
            {
              name: 'Summary',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description:
                  'Brief summary for package cards (e.g., "Madrid 2N, Seville 2N, Granada 1N...")',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              admin: {
                description: 'Short tagline for the package',
              },
            },
            {
              name: 'description',
              type: 'richText',
              required: true,
              admin: {
                description: 'Full package description shown on package page',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Main package image for hero and cards',
              },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: 'Additional package images',
              },
            },
            {
              name: 'brouchre',
              type: 'upload',
              relationTo: 'media',
              required: false,
              label: 'Brochure PDF',
              admin: {
                description: 'Upload PDF brochure for the package',
              },
            },
          ],
        },

        // ==================== TAB 2: ITINERARY ====================
        {
          label: 'Itinerary',
          fields: [
            {
              name: 'destinations',
              type: 'relationship',
              relationTo: 'destinations',
              hasMany: true,
              required: true,
              admin: {
                description: 'Destinations included in this package',
              },
            },
            {
              name: 'route',
              type: 'array',
              labels: { singular: 'City', plural: 'Route' },
              admin: {
                description: 'Cities included with nights (e.g., Madrid 2N, Seville 2N)',
              },
              fields: [
                {
                  name: 'city',
                  type: 'relationship',
                  relationTo: 'cities',
                  required: true,
                },
                {
                  name: 'nights',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Number of nights in this city',
                  },
                },
                {
                  name: 'order',
                  type: 'number',
                  required: true,
                  admin: {
                    description: 'Sequence order',
                  },
                },
              ],
            },
            {
              name: 'itinerary',
              type: 'array',
              labels: { singular: 'Day', plural: 'Day-wise Itinerary' },
              admin: {
                description: 'Complete day-by-day itinerary',
                initCollapsed: true, // ✅ Collapsed by default
              },
              fields: [
                {
                  name: 'dayNumber',
                  type: 'number',
                  required: true,
                  min: 1,
                  admin: {
                    description: 'Day number (e.g., 1, 2, 3)',
                  },
                },
                {
                  name: 'day',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Day label (e.g., "Day 1 - Arrival Into Paris")',
                  },
                },
                {
                  name: 'activities',
                  type: 'array',
                  labels: { singular: 'Activity', plural: 'Activities' },
                  admin: {
                    description: 'Activities for Itinerary Card',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'icon',
                      type: 'upload',
                      relationTo: 'media',
                    },
                    {
                      name: 'description',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'detailsImage',
                      type: 'upload',
                      relationTo: 'media',
                    },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  admin: { description: 'Additional title' },
                },
                {
                  name: 'subtitle',
                  type: 'text',
                  admin: { description: 'Optional subtitle' },
                },
                {
                  name: 'description',
                  type: 'richText',
                  admin: { description: 'Full day description' },
                },
                {
                  name: 'city',
                  type: 'relationship',
                  relationTo: 'cities',
                },
                {
                  name: 'places',
                  type: 'relationship',
                  relationTo: 'places',
                  hasMany: true,
                },
                {
                  name: 'mealsIncluded',
                  type: 'group',
                  label: 'Meals Included',
                  fields: [
                    {
                      name: 'breakfast',
                      type: 'checkbox',
                      defaultValue: false,
                      label: 'Breakfast',
                    },
                    {
                      name: 'lunch',
                      type: 'checkbox',
                      defaultValue: false,
                      label: 'Lunch',
                    },
                    {
                      name: 'dinner',
                      type: 'checkbox',
                      defaultValue: false,
                      label: 'Dinner',
                    },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'notes',
                  type: 'textarea',
                },
              ],
            },
          ],
        },

        // ==================== TAB 3: PRICING & DETAILS ====================
        {
          label: 'Pricing & Details',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'duration',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'e.g., "8N/9D", "7 Days / 8 Nights"',
                  },
                },
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'Starting price per person',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
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
                {
                  name: 'discountedPrice',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Discounted price (optional)',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'rating',
                  type: 'number',
                  min: 0,
                  max: 5,
                  admin: {
                    width: '50%',
                    description: 'Average customer rating',
                  },
                },
                {
                  name: 'bookingsCount30d',
                  type: 'number',
                  min: 0,
                  defaultValue: 0,
                  admin: {
                    width: '50%',
                    description: 'Bookings in past 30 days',
                  },
                },
              ],
            },
            {
              name: 'inclusions',
              type: 'relationship',
              relationTo: 'inclusions',
              hasMany: true,
              admin: {
                description: "What's included",
              },
            },
            {
              name: 'exclusions',
              type: 'relationship',
              relationTo: 'exclusions',
              hasMany: true,
              admin: {
                description: "What's not included",
              },
            },
             {
              name: 'goodToKnow',
              type: 'array',
              labels: { singular: 'Note', plural: 'Good To Know' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                },
                {
                  name: 'text',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },

        // ==================== TAB 4: CONFIGURATION ====================
        {
          label: 'Configuration',
          fields: [
             {
              name: 'isPublished',
              type: 'checkbox',
              defaultValue: true,
              label: 'Publish Status',
            },
            {
              name: 'highlights',
              type: 'array',
              labels: { singular: 'Highlight', plural: 'Package Highlights' },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: '★ Star', value: 'star' },
                    { label: '✈ Flight', value: 'flight' },
                    { label: '🏨 Hotel', value: 'hotel' },
                    { label: '🍽 Meal', value: 'meal' },
                    { label: '🚗 Transport', value: 'transport' },
                    { label: '🎫 Ticket', value: 'ticket' },
                    { label: '📸 Activity', value: 'activity' },
                    { label: '🌟 Feature', value: 'feature' },
                  ],
                  defaultValue: 'star',
                },
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'labels',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: {
                type: { equals: 'package_label' },
              },
              admin: { description: 'Labels like Best Seller' }
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
              name: 'country',
              type: 'relationship',
              relationTo: 'countries',
              admin: {
                description: 'Country for filtering',
              },
            },
            {
              name: 'region',
              type: 'relationship',
              relationTo: 'regions',
              admin: {
                description: 'Region for filtering',
              },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'package-categories',
              hasMany: true,
              admin: { description: 'Target audience' },
            },
            {
              name: 'categoryPills',
              type: 'group',
              label: 'Hero Category Pills',
              admin: {
                description: 'Customizable theme/category progress bars shown in the Package Hero.',
              },
              fields: [
                {
                  name: 'enablePills',
                  type: 'checkbox',
                  label: 'Show Category Pills in Hero',
                  defaultValue: true,
                },
                {
                  name: 'pills',
                  type: 'array',
                  label: 'Category Pills',
                  admin: {
                    condition: (_, siblingData) => siblingData.enablePills,
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: { description: 'e.g. Couples' },
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      required: true,
                      admin: { description: 'e.g. For Newlywed Vacations' },
                    },
                    {
                      name: 'icon',
                      type: 'text',
                      defaultValue: '✈',
                      admin: { description: 'Emoji or simple text icon' },
                    },
                    {
                      name: 'percentage',
                      type: 'number',
                      min: 0,
                      max: 100,
                      defaultValue: 75,
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'themes',
              type: 'relationship',
              relationTo: 'themes',
              hasMany: true,
            },
            {
              name: 'vibe',
              type: 'relationship',
              relationTo: 'vibes',
            },
            {
              name: 'activities',
              type: 'relationship',
              relationTo: 'activities',
              hasMany: true,
            },
            {
              name: 'amenities',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
            },
            {
              name: 'accommodationTypes',
              type: 'relationship',
              relationTo: 'accommodation-types',
              hasMany: true,
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'isFamilyFriendly',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'isHoneymoon',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],

  hooks: {
    afterChange: [
      revalidatePackage, // Your existing specific hook
      // ✅ Add global revalidation
    ],
    afterDelete: [
      revalidatePackageDelete, // Your existing hook
      // ✅ Add global revalidation
    ],
  },
}

export default Packages
