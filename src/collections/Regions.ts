// src/collections/Regions.ts
import type { CollectionConfig } from 'payload'

export const Regions: CollectionConfig = {
  slug: 'regions',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true },
  ],
}

export default Regions
