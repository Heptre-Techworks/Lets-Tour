import { Block } from "payload";
export const HeroSearchBlock: Block = {
  slug: 'heroSearchBlock',
  labels: {
    singular: 'Hero Search Block',
    plural: 'Hero Search Blocks'
  },
  fields: [
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'To travel is to live!'
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: '10,348 ft Mount Everest'
    },
    {
      name: 'searchEnabled',
      type: 'checkbox',
      defaultValue: true
    }
  ]
}
