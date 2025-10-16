// src/heroes/MainHero/config.ts
import type { Field } from 'payload'

export const MainHeroConfig: Field[] = [
  {
    name: 'mainHeroFields',
    label: 'Main Hero Fields',
    type: 'group',
    admin: {
      condition: (_, siblingData) => siblingData?.type === 'mainHero',
    },
    fields: [
      {
        name: 'slides',
        type: 'array',
        label: 'Hero Slides',
        minRows: 1,
        maxRows: 8,
        required: true,
        fields: [
          {
            name: 'backgroundImage',
            type: 'upload',
            relationTo: 'media',
            required: true,
            admin: {
              description: 'The main background image for the slide',
            },
          },
          {
            name: 'headline',
            type: 'textarea',
            required: true,
            defaultValue: 'To travel is to live!',
          },
          {
            name: 'subtitle',
            type: 'textarea',
            defaultValue: '10,348 ft',
          },
          {
            name: 'location',
            type: 'textarea',
            defaultValue: 'Mount Everest',
          },
        ],
      },
      {
        name: 'cloudImage',
        label: 'Cloud Image Overlay',
        type: 'upload',
        relationTo: 'media',
        required: true,
        admin: {
          description: 'Upload a PNG image of clouds with transparent background',
        },
      },
      {
        name: 'enableAirplaneAnimation',
        type: 'checkbox',
        label: 'Enable Airplane Animations',
        defaultValue: true,
      },
      {
        name: 'autoplayDuration',
        type: 'number',
        defaultValue: 8000,
        admin: {
          description: 'Autoplay interval in milliseconds',
        },
      },
      {
        name: 'transitionDuration',
        type: 'number',
        defaultValue: 1000,
        admin: {
          description: 'Slide transition duration in milliseconds',
        },
      },
      {
        type: 'collapsible',
        label: 'Search Form Configuration',
        fields: [
          {
            name: 'destinationOptions',
            type: 'relationship',
            relationTo: 'destinations',
            hasMany: true,
            admin: {
              description: 'Destinations to show in search dropdown',
            },
          },
          {
            name: 'categoryOptions',
            type: 'relationship',
            relationTo: 'package-categories',
            hasMany: true,
            admin: {
              description: 'Package categories for search',
            },
          },
          {
            name: 'buttonLabel',
            type: 'text',
            defaultValue: 'Apply',
          },
          {
            name: 'placeholders',
            type: 'group',
            fields: [
              {
                name: 'destination',
                type: 'text',
                defaultValue: 'Destination',
              },
              {
                name: 'date',
                type: 'text',
                defaultValue: 'Date',
              },
              {
                name: 'people',
                type: 'text',
                defaultValue: 'No of people',
              },
              {
                name: 'category',
                type: 'text',
                defaultValue: 'Category',
              },
            ],
          },
        ],
      },
    ],
  },
]
