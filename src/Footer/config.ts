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
      admin: {
        description: 'Upload your logo for the footer (optional)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Footer Description',
      required: false,
      admin: {
        description: 'Brief description or tagline displayed under the logo',
        placeholder: 'Discover unforgettable travel experiences and create memories that last a lifetime.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Top-level Nav',
      maxRows: 10,
      admin: {
        description: 'Used when Nav Groups are not defined. Define Quick Links here.',
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
      label: 'Nav Groups (Footer Columns)',
      maxRows: 4,
      admin: {
        description: 'Create organized footer columns (recommended: 3-4 columns). Each group becomes a column.',
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [
        {
          name: 'groupLabel',
          type: 'text',
          required: true,
          label: 'Column Heading',
          admin: {
            description: 'e.g., "Company", "Resources", "Support"',
          },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          maxRows: 8,
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
      label: 'Social Media Links',
      maxRows: 6,
      admin: {
        description: 'Add your social media profiles. Use the label for the platform name (e.g., "Facebook", "Instagram")',
        initCollapsed: true,
        components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
      },
      fields: [link({ appearances: false })],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal & Policy Links',
      maxRows: 6,
      admin: {
        description: 'Add legal pages like Privacy Policy, Terms of Service, Cookie Policy, etc.',
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
      admin: {
        description: 'Enable/disable the dark/light theme toggle',
      },
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
      required: true,
      defaultValue: `© ${new Date().getFullYear()} Tour. All rights reserved.`,
      admin: {
        description: 'Copyright notice displayed at the bottom of the footer',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
