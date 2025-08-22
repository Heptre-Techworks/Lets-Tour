import { CollectionConfig } from "payload"

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  labels: {
    singular: 'Destination',
    plural: 'Destinations'
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'featured']
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar'
      },
      hooks: {
        beforeValidate: [
          ({ value, operation, data }) => {
            if (operation === 'create' || !value) {
              return data?.name?.toLowerCase().replace(/ /g, '-')
            }
            return value
          }
        ]
      }
    },
    {
      name: 'country',
      type: 'text',
      required: true
    },
    {
      name: 'continent',
      type: 'select',
      options: [
        { label: 'Asia', value: 'asia' },
        { label: 'Europe', value: 'europe' },
        { label: 'North America', value: 'north-america' },
        { label: 'South America', value: 'south-america' },
        { label: 'Africa', value: 'africa' },
        { label: 'Oceania', value: 'oceania' }
      ]
    },
    {
      name: 'description',
      type: 'richText',
      required: true
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 200
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'caption',
          type: 'text'
        }
      ]
    },
    {
      name: 'startingPrice',
      type: 'number',
      admin: {
        description: 'Starting price for packages to this destination'
      }
    },
    {
      name: 'packageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of packages available'
      }
    }
  ]
}
