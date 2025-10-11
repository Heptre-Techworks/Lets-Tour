// payload/configs/MainHeroConfig.ts
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
              description: 'The main background image for the slide.',
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
          description:
            'Upload a PNG image of clouds with a transparent background. This will be layered at the bottom.',
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
          description: 'Autoplay interval in milliseconds (e.g., 8000 = 8 seconds).',
        },
      },
      {
        name: 'transitionDuration',
        type: 'number',
        defaultValue: 1000,
        admin: {
          description: 'Slide transition duration in milliseconds.',
        },
      },
      // Search Form Configuration
      {
        type: 'collapsible',
        label: 'Search Form Configuration',
        fields: [
          {
            name: 'destinationOptions',
            type: 'array',
            label: 'Destination Options',
            defaultValue: [
              { label: 'Spain', value: 'spain' },
              { label: 'France', value: 'france' },
            ],
            fields: [
              { name: 'label', type: 'textarea', required: true },
              { name: 'value', type: 'textarea', required: true },
            ],
          },
          {
            name: 'categoryOptions',
            type: 'array',
            label: 'Category Options',
            defaultValue: [
              { label: 'Adventure', value: 'adventure' },
              { label: 'Honeymoon', value: 'honeymoon' },
            ],
            fields: [
              { name: 'label', type: 'textarea', required: true },
              { name: 'value', type: 'textarea', required: true },
            ],
          },
          {
            name: 'buttonLabel',
            type: 'textarea',
            defaultValue: 'Apply',
          },
          {
            name: 'placeholders',
            type: 'group',
            fields: [
              { name: 'destination', type: 'textarea', defaultValue: 'Destination' },
              { name: 'date', type: 'textarea', defaultValue: 'Date' },
              { name: 'people', type: 'textarea', defaultValue: 'No of people' },
              { name: 'category', type: 'textarea', defaultValue: 'Category' },
            ],
          },
        ],
      },
    ],
  },
]