
import { CollectionConfig } from "payload"

export const PackageCategories: CollectionConfig = {
  slug: 'package-categories',
  labels: {
    singular: 'Package Category',
    plural: 'Package Categories'
  },
  admin: {
    useAsTitle: 'name'
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
      admin: { position: 'sidebar' },
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
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for category styling'
      }
    }
  ]
}
