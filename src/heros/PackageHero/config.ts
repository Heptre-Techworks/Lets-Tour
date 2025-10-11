// payload/configs/PackageHeroConfig.ts
import type { Field } from 'payload'

export const PackageHeroConfig: Field[] = [
  {
    name: 'travelPackageFields',
    label: 'Travel Package Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'travelPackage',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        defaultValue: 'Spanish Escape',
        admin: {
          description: 'The main title of the travel package',
        },
      },
      {
        name: 'rating',
        type: 'number',
        required: true,
        defaultValue: 5,
        min: 1,
        max: 5,
        admin: {
          description: 'Rating out of 5 stars',
        },
      },
      {
        name: 'location',
        type: 'textarea',
        required: true,
        defaultValue: 'Madrid 2N, Seville 2N, Granada 1N, Barcelona 3N',
        admin: {
          description: 'Location itinerary description',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        required: true,
        admin: {
          description: 'Detailed description of the travel package',
        },
      },
      {
        name: 'vacationTypes',
        type: 'array',
        label: 'Vacation Types',
        minRows: 1,
        maxRows: 4,
        required: true,
        defaultValue: [
          {
            type: 'Couples',
            label: 'For Newlywed Vacations',
            icon: '❤️',
            percentage: 75,
          },
          {
            type: 'Family',
            label: 'For Family Vacations',
            icon: '👨‍👩‍👧‍👦',
            percentage: 25,
          },
        ],
        fields: [
          {
            name: 'type',
            type: 'text',
            required: true,
            admin: {
              description: 'Type name (e.g., Couples, Family)',
            },
          },
          {
            name: 'label',
            type: 'text',
            required: true,
            admin: {
              description: 'Descriptive label for the vacation type',
            },
          },
          {
            name: 'icon',
            type: 'text',
            required: true,
            admin: {
              description: 'Emoji icon for the vacation type',
            },
          },
          {
            name: 'percentage',
            type: 'number',
            required: true,
            min: 0,
            max: 100,
            admin: {
              description: 'Percentage value (0-100)',
            },
          },
        ],
      },
      {
        name: 'pricing',
        type: 'group',
        label: 'Pricing Information',
        fields: [
          {
            name: 'originalPrice',
            type: 'text',
            required: true,
            defaultValue: '150,450',
            admin: {
              description: 'Original price (formatted with commas)',
            },
          },
          {
            name: 'discountedPrice',
            type: 'text',
            required: true,
            defaultValue: '117,927',
            admin: {
              description: 'Discounted price (formatted with commas)',
            },
          },
          {
            name: 'currency',
            type: 'text',
            defaultValue: '₹',
            admin: {
              description: 'Currency symbol',
            },
          },
        ],
      },
      {
        name: 'bookingCount',
        type: 'text',
        required: true,
        defaultValue: '250+',
        admin: {
          description: 'Number of bookings (e.g., 250+)',
        },
      },
      {
        name: 'recentBookings',
        type: 'array',
        label: 'Recent Booking Avatars',
        minRows: 1,
        maxRows: 6,
        admin: {
          description: 'Profile images of recent customers',
        },
        fields: [
          {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
        ],
      },
      {
        name: 'mainImage',
        label: 'Main Package Image',
        type: 'upload',
        relationTo: 'media',
        required: true,
        admin: {
          description: 'The main promotional image for the package',
        },
      },
      {
        name: 'backgroundImage',
        label: 'Background Image',
        type: 'upload',
        relationTo: 'media',
        required: true,
        admin: {
          description: 'Background image for the card',
        },
      },
      {
        name: 'buttons',
        type: 'group',
        label: 'Button Configuration',
        fields: [
          {
            name: 'bookNowLabel',
            type: 'text',
            defaultValue: 'Book now',
          },
          {
            name: 'enableDownload',
            type: 'checkbox',
            label: 'Enable Download Button',
            defaultValue: true,
          },
        ],
      },
    ],
  },
]
