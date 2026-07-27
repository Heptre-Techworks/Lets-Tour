import type { CollectionConfig, FieldAccess } from 'payload'
import { sendLeadEmail } from '../hooks/sendLeadEmail'
import { derivePaymentStatus } from '../hooks/derivePaymentStatus'
import { syncDepartureSeats } from '../hooks/syncDepartureSeats'

const canReadBookingUser: FieldAccess = ({ req, doc }) => {
  const user = req?.user
  if (!user) return false
  if (!doc) return user.role === 'agent' || user.role === 'admin'
  return user.id === doc.user || user.role === 'agent' || user.role === 'admin'
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',

  admin: {
    useAsTitle: 'bookingReference',
    defaultColumns: ['bookingReference', 'user', 'package', 'startDate', 'status'],
    group: 'Trip Requests',
  },
 
  access: {
    read: ({ req }) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'agent' || user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: () => true, // ✅ Changed to allow public booking requests
    update: ({ req }) => req?.user?.role === 'agent' || req?.user?.role === 'admin',
    delete: ({ req }) => req?.user?.role === 'agent' || req?.user?.role === 'admin',
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
      // ✅ Removed 'required: true'
      access: {
        read: canReadBookingUser,
      },
      admin: {
        description: 'User account (optional for guest bookings)',
      },
    },
    // ✅ ADD guest contact fields
    {
      name: 'guestName',
      type: 'text',
      admin: {
        description: 'Full name (for guest bookings)',
      },
    },
    {
      name: 'guestEmail',
      type: 'email',
      admin: {
        description: 'Email (for guest bookings)',
      },
    },
    {
      name: 'guestPhone',
      type: 'text',
      admin: {
        description: 'Phone (for guest bookings)',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
    },
    {
      name: 'packageDeparture',
      type: 'relationship',
      relationTo: 'package-departures',
      admin: {
        description: 'The fixed departure this booking is for (optional).',
      },
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
    {
      type: 'collapsible',
      label: 'Payment (Razorpay)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'onlinePaymentOverride',
          type: 'select',
          defaultValue: 'inherit',
          options: [
            { label: 'Inherit (departure / package default)', value: 'inherit' },
            { label: 'Force enabled', value: 'enabled' },
            { label: 'Force disabled', value: 'disabled' },
          ],
          admin: {
            description: 'Override whether this booking can be paid online.',
          },
        },
        {
          name: 'generatePaymentLink',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/Admin/Bookings/GeneratePaymentLinkButton#GeneratePaymentLinkButton',
            },
          },
        },
        {
          name: 'paymentLinkUrl',
          type: 'text',
          admin: { readOnly: true, description: 'Most recent Razorpay payment link.' },
        },
        {
          name: 'razorpayPaymentLinkId',
          type: 'text',
          index: true,
          admin: { readOnly: true },
        },
        {
          name: 'razorpayOrderId',
          type: 'text',
          index: true,
          admin: { readOnly: true, description: 'Set for on-site Checkout (Orders API).' },
        },
        {
          // Not `unique` on purpose: most bookings have no payment id, and a unique
          // index would collide on multiple nulls. Idempotency is enforced in
          // reconcilePayment via the paymentEvents log.
          name: 'razorpayPaymentId',
          type: 'text',
          index: true,
          admin: { readOnly: true },
        },
        {
          name: 'razorpaySignature',
          type: 'text',
          admin: { readOnly: true, hidden: true },
        },
        {
          name: 'paymentVerified',
          type: 'checkbox',
          defaultValue: false,
          admin: { readOnly: true, description: 'True once a payment has been verified.' },
        },
        {
          name: 'paymentEvents',
          type: 'json',
          admin: { readOnly: true, description: 'Audit log of payment webhook / verify events.' },
        },
      ],
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
      derivePaymentStatus,
    ],
    afterChange: [sendLeadEmail, syncDepartureSeats],
  },
}

export default Bookings
