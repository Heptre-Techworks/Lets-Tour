// src/collections/Packages.ts
import type { CollectionConfig } from 'payload'

export const Packages: CollectionConfig = {
  slug: 'packages',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true }, // no slug; use id
    { name: 'tagline', type: 'text' },
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'rating', type: 'number', min: 0, max: 5 },
    { name: 'stars', type: 'number', min: 0, max: 5 },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'isFamilyFriendly', type: 'checkbox', defaultValue: false },
    { name: 'bookingsCount30d', type: 'number', min: 0, admin: { position: 'sidebar' } },

    { name: 'minPricePerPerson', type: 'number', min: 0 },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'INR', value: 'INR' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
      ],
      defaultValue: 'INR',
    },
    { name: 'durationDays', type: 'number', min: 1, required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },

    {
      name: 'route',
      type: 'array',
      labels: { singular: 'Stop', plural: 'Route' },
      fields: [
        { name: 'city', type: 'relationship', relationTo: 'cities', required: true },
        { name: 'notes', type: 'text' },
      ],
    },

    {
      name: 'itinerary',
      type: 'array',
      labels: { singular: 'Day', plural: 'Itinerary' },
      fields: [
        { name: 'dayNumber', type: 'number', required: true, min: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'richText' },
        {
          name: 'mealsIncluded',
          type: 'group',
          fields: [
            { name: 'breakfast', type: 'checkbox', defaultValue: false },
            { name: 'lunch', type: 'checkbox', defaultValue: false },
            { name: 'dinner', type: 'checkbox', defaultValue: false },
          ],
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'places', type: 'relationship', relationTo: 'places', hasMany: true },
        { name: 'notes', type: 'textarea' },
      ],
    },

    {
      name: 'highlights',
      type: 'array',
      labels: { singular: 'Highlight', plural: 'Highlights' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },

    {
      name: 'goodToKnow',
      type: 'array',
      labels: { singular: 'Note', plural: 'Good To Know' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },

    {
      name: 'prices',
      type: 'array',
      labels: { singular: 'Price', plural: 'Prices' },
      fields: [
        {
          name: 'roomOccupancy',
          type: 'select',
          options: [
            { label: 'Single', value: 'single' },
            { label: 'Double', value: 'double' },
            { label: 'Triple', value: 'triple' },
          ],
          required: true,
        },
        { name: 'pricePerPerson', type: 'number', min: 0, required: true },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'INR', value: 'INR' },
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
          ],
          required: true,
        },
        { name: 'validFrom', type: 'date' },
        { name: 'validTo', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
    },

    { name: 'categories', type: 'relationship', relationTo: 'package-categories', hasMany: true },
    { name: 'activities', type: 'relationship', relationTo: 'activities', hasMany: true },
    { name: 'amenities', type: 'relationship', relationTo: 'amenities', hasMany: true },
    { name: 'accommodationTypes', type: 'relationship', relationTo: 'accommodation-types', hasMany: true },
    { name: 'inclusions', type: 'relationship', relationTo: 'inclusions', hasMany: true },
    { name: 'exclusions', type: 'relationship', relationTo: 'exclusions', hasMany: true },
  ],
}

export default Packages
