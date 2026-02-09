// src/collections/Reviews.ts
import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'rating', 'published'],
    group: 'Marketing',
  },

  access: {
    create: anyone,  // ✅ Changed from 'authenticated' to 'anyone'
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      // ✅ Removed 'required: true' - make optional for public forms
      admin: {
        description: 'Reviewer (leave empty for public submissions)',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        description: 'Package reviewed (optional)',
      },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: {
        description: 'Destination reviewed (optional)',
      },
    },
    // ✅ ADD these fields for anonymous submissions
    {
      name: 'submitterName',
      type: 'text',
      admin: {
        description: 'Name (for anonymous submissions)',
      },
    },
    {
      name: 'submitterEmail',
      type: 'email',
      admin: {
        description: 'Email (for anonymous submissions)',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      admin: {
        description: 'Star rating (1-5)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Review headline',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Review content',
      },
    },
    {
      name: 'photos',
      type: 'array',
      labels: {
        singular: 'Photo',
        plural: 'Photos',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'tripDate',
      type: 'date',
      admin: {
        description: 'When the trip took place',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,  // ✅ Default to false, admin reviews before publishing
      admin: {
        position: 'sidebar',
        description: 'Publish to show on frontend',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature in "Client Stories" homepage section',
      },
    },
    {
      name: 'helpful',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Number of "helpful" votes',
        readOnly: true,
      },
    },
  ],
}

export default Reviews
