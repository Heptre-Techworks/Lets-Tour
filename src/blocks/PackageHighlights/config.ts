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
      name: 'heading',
      type: 'text',
      defaultValue: 'Package highlights',
      required: true,
      admin: {
        description: 'Main heading for the package highlights section',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
      admin: {
        description: 'Subtitle text below the heading',
      },
    },
    {
      name: 'highlights',
      type: 'array',
      required: true,
      labels: { 
        singular: 'Highlight', 
        plural: 'Highlights' 
      },
      minRows: 1,
      maxRows: 20,
      admin: {
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
      required: true,
      labels: { 
        singular: 'Gallery Image', 
        plural: 'Gallery Images' 
      },
      minRows: 7,
      maxRows: 7,
      admin: {
        description: 'Exactly 7 images for the gallery mosaic layout (positions are pre-defined)',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Upload an image for the gallery',
          },
        },
      ],
    },
  ],
};

export default PackageHighlights;
