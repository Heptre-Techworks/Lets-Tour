import type { GlobalConfig } from 'payload'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: () => true },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Footer Logo',
      required: false,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Top-level Nav',
      maxRows: 10,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [
        link({ appearances: false }),
      ],
    },
    {
      name: 'navGroups',
      type: 'array',
      label: 'Nav Groups (Columns)',
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [
        {
          name: 'groupLabel',
          type: 'text',
          required: true,
          label: 'Group Label',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          admin: {
            initCollapsed: true,
            components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
          },
          fields: [link({ appearances: false })],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      maxRows: 10,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [link({ appearances: false })],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links',
      maxRows: 10,
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [link({ appearances: false })],
    },
    {
      name: 'showThemeSelector',
      type: 'checkbox',
      label: 'Show Theme Selector',
      defaultValue: true,
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
      required: false,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
