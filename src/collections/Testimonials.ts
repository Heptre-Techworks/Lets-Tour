import { CollectionConfig } from "payload";
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials'
  },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'tour', 'rating']
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true
    },
    {
      name: 'customerLocation',
      type: 'text'
    },
    {
      name: 'customerPhoto',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'packages'
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true
    },
    {
      name: 'review',
      type: 'textarea',
      required: true
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false
    }
  ]
}
