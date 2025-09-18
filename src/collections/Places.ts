// src/collections/Places.ts
import type { CollectionConfig } from 'payload'

export const Places: CollectionConfig = {
  slug: 'places',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'city', type: 'relationship', relationTo: 'cities', required: true },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Attraction', value: 'attraction' },
        { label: 'Museum', value: 'museum' },
        { label: 'Monument', value: 'monument' },
        { label: 'Park', value: 'park' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    { name: 'description', type: 'textarea' },
    { name: 'address', type: 'text' },
    { name: 'latitude', type: 'number' },
    { name: 'longitude', type: 'number' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

export default Places
