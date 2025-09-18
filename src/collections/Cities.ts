// src/collections/Cities.ts
import type { CollectionConfig } from 'payload'

export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true },
    { name: 'regions', type: 'relationship', relationTo: 'regions' },
    { name: 'latitude', type: 'number' },
    { name: 'longitude', type: 'number' },
    { name: 'description', type: 'textarea' },
  ],
}

export default Cities
