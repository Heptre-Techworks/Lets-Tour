// src/collections/BulkBookingRequests.ts
import type { CollectionConfig } from 'payload'

export const BulkBookingRequests: CollectionConfig = {
  slug: 'bulk-booking-requests',
  admin: { useAsTitle: 'contactName' },
  access: {
    create: () => true,
    read: ({ req }) => req?.user?.role === 'admin',
    update: ({ req }) => req?.user?.role === 'admin',
    delete: ({ req }) => req?.user?.role === 'admin',
  },
  fields: [
    { name: 'contactName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'destination', type: 'relationship', relationTo: 'destinations' },
    { name: 'desiredStartDate', type: 'date' },
    { name: 'desiredEndDate', type: 'date' },
    { name: 'numPeople', type: 'number', min: 1, required: true },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
      ],
    },
  ],
}

export default BulkBookingRequests
