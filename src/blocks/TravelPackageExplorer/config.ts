import type { Block } from 'payload';

export const TravelPackageExplorer: Block = {
  slug: 'travelPackageExplorer',
  interfaceName: 'TravelPackageExplorerBlock',
  labels: { 
    singular: 'Travel Package Explorer', 
    plural: 'Travel Package Explorers' 
  },
  fields: [
    {
      name: 'packages',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Package', plural: 'Packages' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Package title (e.g., "Spanish Escape")',
          },
        },
        {
          name: 'location',
          type: 'text',
          required: true,
          admin: {
            description: 'Location details (e.g., "Madrid 2N, Granada 1N, Valencia 1N, Ibiza 2N")',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'rating',
              type: 'number',
              required: true,
              min: 1,
              max: 5,
              defaultValue: 5,
              admin: {
                description: 'Rating (1-5 stars)',
              },
            },
            {
              name: 'reviews',
              type: 'number',
              required: true,
              defaultValue: 0,
              admin: {
                description: 'Number of reviews',
              },
            },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Package description',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Current price in ₹',
              },
            },
            {
              name: 'originalPrice',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Original price (for showing discount)',
              },
            },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Duration in days',
          },
        },
        {
          name: 'experiences',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Adventure', value: 'Adventure' },
            { label: 'Relaxing', value: 'Relaxing' },
            { label: 'Cultural', value: 'Cultural' },
            { label: 'Sightseeing', value: 'Sightseeing' },
            { label: 'Party', value: 'Party' },
          ],
          admin: {
            description: 'Types of experiences offered',
          },
        },
        {
          name: 'accommodationType',
          type: 'select',
          required: true,
          options: [
            { label: 'Hotel', value: 'Hotel' },
            { label: 'Resort', value: 'Resort' },
            { label: 'Boutique Hotel', value: 'Boutique Hotel' },
            { label: 'Villa / Townhouse', value: 'Villa / Townhouse' },
          ],
        },
        {
          name: 'amenities',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Free Wifi', value: 'Free Wifi' },
            { label: 'Swimming Pool', value: 'Swimming Pool' },
            { label: 'Breakfast Included', value: 'Breakfast Included' },
            { label: 'Gym', value: 'Gym' },
            { label: 'Airport Transfer', value: 'Airport Transfer' },
            { label: 'City View', value: 'City View' },
            { label: 'Private Pool', value: 'Private Pool' },
            { label: 'Beach Access', value: 'Beach Access' },
          ],
          admin: {
            description: 'Amenities included',
          },
        },
        {
          name: 'province',
          type: 'select',
          required: true,
          options: [
            { label: 'Madrid', value: 'Madrid' },
            { label: 'Andalusia', value: 'Andalusia' },
            { label: 'Catalonia', value: 'Catalonia' },
            { label: 'Balearic Islands', value: 'Balearic Islands' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'image',
              label: 'Package Image (upload)',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Upload package image',
              },
            },
            {
              name: 'imageUrl',
              label: 'Image URL (external)',
              type: 'text',
              admin: {
                description: 'Or provide external image URL',
              },
            },
          ],
        },
        {
          name: 'inclusions',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Flights', value: 'Flights' },
            { label: 'Stay', value: 'Stay' },
            { label: 'Cruise tickets', value: 'Cruise tickets' },
            { label: 'Transfers', value: 'Transfers' },
            { label: 'Breakfast', value: 'Breakfast' },
            { label: 'Tour guide', value: 'Tour guide' },
            { label: 'City Tour Pass', value: 'City Tour Pass' },
            { label: 'Ferry Tickets', value: 'Ferry Tickets' },
            { label: 'Club Access', value: 'Club Access' },
            { label: 'Villa Stay', value: 'Villa Stay' },
          ],
          admin: {
            description: 'What is included in the package',
          },
        },
        {
          name: 'suitability',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'couples',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 100,
                  defaultValue: 80,
                  admin: {
                    description: 'Suitability percentage for couples (0-100)',
                  },
                },
                {
                  name: 'family',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 100,
                  defaultValue: 70,
                  admin: {
                    description: 'Suitability percentage for families (0-100)',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'recentBookings',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            description: 'Number of recent bookings to display',
          },
        },
        {
          name: 'sights',
          type: 'array',
          required: true,
          labels: { singular: 'Sight', plural: 'Sights' },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Sight or attraction name',
              },
            },
          ],
          admin: {
            description: 'Key sights and attractions included in the package',
          },
        },
      ],
    },
  ],
};

export default TravelPackageExplorer;
