import type { CollectionConfig } from 'payload'
import { sendLeadEmail } from '../hooks/sendLeadEmail'

export const CustomTripRequests: CollectionConfig = {
  slug: 'custom-trip-requests',
  admin: {
    useAsTitle: 'id',
    group: 'User Data',
  },
  access: {
    create: () => true,
    read: ({ req }) => req?.user?.role === 'admin',
    update: ({ req }) => req?.user?.role === 'admin',
    delete: ({ req }) => req?.user?.role === 'admin',
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'destination', type: 'relationship', relationTo: 'destinations' },
    { name: 'budgetMin', type: 'number', min: 0 },
    { name: 'budgetMax', type: 'number', min: 0 },
    { name: 'numPeople', type: 'number', min: 1, required: true },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'preferences', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Curate', value: 'curate' },
        { label: 'Plan My Trip', value: 'plan_my_trip' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Closed', value: 'closed' },
      ],
    },
  ],
  hooks: {
    afterChange: [sendLeadEmail],
  },
}

export default CustomTripRequests
