import type { GlobalConfig } from 'payload'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo Image',
      required: true,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
      maxRows: 10,
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: 'curateButton',
      type: 'group',
      label: 'Curate Button',
      fields: [
        {
          name: 'show',
          type: 'checkbox',
          label: 'Show Curate Button',
          defaultValue: true,
        },
        {
          name: 'text',
          type: 'text',
          label: 'Button Text',
          defaultValue: 'Curate',
          admin: {
            condition: (_, siblingData) => siblingData?.show,
          },
        },
        {
          name: 'href',
          type: 'text',
          label: 'Button Link',
          defaultValue: '/curate',
          admin: {
            condition: (_, siblingData) => siblingData?.show,
          },
        },
      ],
    },
    {
      name: 'mainNav',
      type: 'array',
      label: 'Main Navigation (Center)',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Dynamic Menu', value: 'dynamic' },
          ],
          defaultValue: 'link',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'link',
          },
        },
        {
          name: 'resource',
          type: 'select',
          options: [
            { label: 'Destinations', value: 'destinations' },
            { label: 'Packages', value: 'packages' },
            { label: 'Package Categories', value: 'package-categories' },
            { label: 'International Packages', value: 'international-package' },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'dynamic',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
