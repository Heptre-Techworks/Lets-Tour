// src/collections/Bookings.ts
import type { CollectionConfig, FieldAccess } from 'payload'

const canReadBookingUser: FieldAccess = ({ req, doc }) => {
  const user = req?.user
  if (!user) return false               // unauthenticated: hide field
  if (!doc) return user.role === 'admin' // Access Operation: allow only admin
  return user.id === doc.user || user.role === 'admin'
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  access: {
    read: ({ req }) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: ({ req }) => Boolean(req?.user),
    update: ({ req }) => req?.user?.role === 'admin',
    delete: ({ req }) => req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: { read: canReadBookingUser },
    },
    { name: 'package', type: 'relationship', relationTo: 'packages', required: true },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
  ],
}

export default Bookings
