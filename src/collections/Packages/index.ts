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
    defaultColumns: ['name', 'destinations', 'price', 'duration', 'isFeatured'],
    group: 'Content',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  
  fields: [
    // ==================== BASIC INFO ====================
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
      name: 'tagline',
      type: 'text',
      admin: {
        description: 'Short tagline for the package',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description: 'Brief summary for package cards (e.g., "Madrid 2N, Seville 2N, Granada 1N...")',
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

    // ==================== IMAGES ====================
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

    // ==================== DESTINATIONS & ROUTE ====================
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

    // ==================== DURATION & PRICING ====================
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

    // ==================== STAR RATING ====================
    {
      name: 'starRating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Star rating (1-5 stars) shown on package hero',
      },
    },

    // ==================== ITINERARY (Day-wise) - ENHANCED ====================
    {
      name: 'itinerary',
      type: 'array',
      labels: { singular: 'Day', plural: 'Day-wise Itinerary' },
      admin: {
        description: 'Complete day-by-day itinerary - used by DynamicScroller block',
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
            description: 'Day label for DynamicScroller (e.g., "Day 1 - Arrival Into Paris")',
          },
        },
        
        // ✅ ADDED: Activities array for DynamicScroller itinerary cards
        {
          name: 'activities',
          type: 'array',
          labels: { singular: 'Activity', plural: 'Activities for Itinerary Card' },
          admin: {
            description: 'Activities shown in DynamicScroller itinerary cards',
            initCollapsed: true,
          },
          fields: [
            {
              name: 'icon',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Small icon for this activity (e.g., plane, hotel, food)',
              },
            },
            {
              name: 'description',
              type: 'text',
              required: true,
              admin: {
                description: 'Activity description (e.g., "Check-in at hotel", "Visit Eiffel Tower")',
              },
            },
            {
              name: 'detailsImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional thumbnail image for this activity',
              },
            },
          ],
        },
        
        // Existing fields for detail page
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Additional title (for package detail page)',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'Optional subtitle',
          },
        },
        {
          name: 'description',
          type: 'richText',
          admin: {
            description: 'Full day description for package detail page',
          },
        },
        {
          name: 'city',
          type: 'relationship',
          relationTo: 'cities',
          admin: {
            description: 'City visited on this day',
          },
        },
        {
          name: 'places',
          type: 'relationship',
          relationTo: 'places',
          hasMany: true,
          admin: {
            description: 'Places/attractions visited on this day',
          },
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
          admin: {
            description: 'Hero image for this day',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Additional notes/tips for this day',
          },
        },
      ],
    },

    // ==================== HIGHLIGHTS (PackageHighlights block) ====================
    {
      name: 'highlights',
      type: 'array',
      labels: { singular: 'Highlight', plural: 'Package Highlights' },
      admin: {
        description: 'Key highlights with icons (e.g., "★ Return Economy Class Airfare")',
      },
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

    // ==================== INCLUSIONS & EXCLUSIONS ====================
    {
      name: 'inclusions',
      type: 'relationship',
      relationTo: 'inclusions',
      hasMany: true,
      admin: {
        description: 'What\'s included in the package',
      },
    },
    {
      name: 'exclusions',
      type: 'relationship',
      relationTo: 'exclusions',
      hasMany: true,
      admin: {
        description: 'What\'s not included',
      },
    },

    // ==================== GOOD TO KNOW (InfoPanel block) ====================
    {
      name: 'goodToKnow',
      type: 'array',
      labels: { singular: 'Note', plural: 'Good To Know' },
      admin: {
        description: 'Important information for travelers',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Info title (optional)',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ==================== CATEGORIZATION ====================
    {
      name: 'labels',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Package labels like Best Seller / Premium',
      },
      filterOptions: {
        type: { equals: 'package_label' },
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'package-categories',
      hasMany: true,
      admin: {
        description: 'Target audience (Couples, Family, Solo, etc.)',
      },
    },
    {
      name: 'activities',
      type: 'relationship',
      relationTo: 'activities',
      hasMany: true,
      admin: {
        description: 'Activity types included',
      },
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

    // ✅ NEW: VIBE FIELD (Added here, after other categorization fields)
    {
      name: 'vibe',
      type: 'relationship',
      relationTo: 'vibes',
      admin: {
        description: 'Package vibe/mood (e.g., Outdoor, Relaxing, Glamping, Girls Day Out)',
        position: 'sidebar',
      },
    },
        // ==================== RATINGS & BOOKINGS ====================
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number' as const,
          min: 0,
          max: 5,
          admin: {
            width: '50%',
            description: 'Average customer rating',
          },
        },
        {
          name: 'bookingsCount30d',
          type: 'number' as const,
          min: 0,
          defaultValue: 0,
          admin: {
            width: '50%',
            description: 'Bookings in past 30 days (e.g., "250+ bookings")',
          },
        },
      ],
    },


    // ==================== STATUS FLAGS ====================
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in featured sections',
      },
    },
    {
      name: 'isFamilyFriendly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isHoneymoon',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
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
    afterChange: [
      revalidatePackage,    // Your existing specific hook
             // ✅ Add global revalidation
    ],
    afterDelete: [
      revalidatePackageDelete,    // Your existing hook
           // ✅ Add global revalidation
    ],
  },
}

export default Packages
