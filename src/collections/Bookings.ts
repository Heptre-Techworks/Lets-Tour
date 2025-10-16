// src/collections/Bookings.ts
import type { CollectionConfig, FieldAccess } from 'payload'

const canReadBookingUser: FieldAccess = ({ req, doc }) => {
  const user = req?.user
  if (!user) return false
  if (!doc) return user.role === 'agent'
  return user.id === doc.user || user.role === 'agent'
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  
  admin: {
    useAsTitle: 'bookingReference',
    defaultColumns: ['bookingReference', 'user', 'package', 'startDate', 'status'],
    group: 'Bookings',
  },

  access: {
    read: ({ req }) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'agent') return true
      return { user: { equals: user.id } }
    },
    create: ({ req }) => Boolean(req?.user),
    update: ({ req }) => req?.user?.role === 'agent',
    delete: ({ req }) => req?.user?.role === 'agent',
  },

  fields: [
    {
      name: 'bookingReference',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique booking ID',
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        read: canReadBookingUser,
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            width: '50%',
            description: 'Trip start date',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Trip end date',
          },
        },
      ],
    },
    {
      name: 'bookingDate',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Date booking was made',
        readOnly: true,
      },
    },
    {
      name: 'numberOfPeople',
      type: 'group',
      fields: [
        {
          name: 'adults',
          type: 'number',
          min: 1,
          required: true,
          defaultValue: 1,
        },
        {
          name: 'children',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'infants',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'totalPrice',
          type: 'number',
          min: 0,
          required: true,
          admin: {
            width: '33%',
          },
        },
        {
          name: 'paidAmount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            width: '33%',
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
            width: '34%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Partial', value: 'partial' },
            { label: 'Completed', value: 'completed' },
            { label: 'Refunded', value: 'refunded' },
          ],
          defaultValue: 'pending',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Completed', value: 'completed' },
          ],
          defaultValue: 'pending',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'contactDetails',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'address',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'specialRequests',
      type: 'textarea',
      admin: {
        description: 'Customer special requests',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to customer)',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data.bookingReference) {
          data.bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        }
        return data
      },
    ],
  },
}

export default Bookings
