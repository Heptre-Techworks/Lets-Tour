import type { Block } from 'payload';

export const PackageHighlights: Block = {
  slug: 'packageHighlights',
  interfaceName: 'PackageHighlightsBlock',
  labels: { 
    singular: 'Package Highlights', 
    plural: 'Package Highlights' 
  },
  fields: [
    {
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Auto (from URL)', value: 'auto' },
        { label: 'Select Package', value: 'package' },
      ],
      admin: {
        description: 'Choose where to load highlights from',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'package',
        description: 'Select a specific package',
      },
    },

    // Manual fields
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Package highlights',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
        description: 'Main heading for the highlights section',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
        description: 'Subtitle text below the heading',
      },
    },
    {
      name: 'highlights',
      type: 'array',
      labels: { 
        singular: 'Highlight', 
        plural: 'Highlights' 
      },
      minRows: 1,
      maxRows: 20,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
        description: 'List of package highlights (each with a star icon)',
      },
      fields: [
        {
          name: 'highlightText',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g., Return Economy Class Airfare',
          },
        },
      ],
    },
    {
      name: 'galleryImages',
      type: 'array',
      labels: { 
        singular: 'Gallery Image', 
        plural: 'Gallery Images' 
      },
      minRows: 7,
      maxRows: 7,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
        description: 'Exactly 7 images for the gallery mosaic layout',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
};

export default PackageHighlights;
