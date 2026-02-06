import type { Block } from 'payload';

export const StaticImageBlock: Block = {
  slug: 'staticImageBlock',
  labels: {
    singular: 'Static Image Block',
    plural: 'Static Image Blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Select the image to display',
      },
    },
    {
      name: 'overlay',
      type: 'checkbox',
      label: 'Show dark overlay',
      defaultValue: true,
      admin: {
        description: 'Add a dark overlay on top of the image',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      required: false,
      min: 0,
      max: 1,
      defaultValue: 0.5,
      admin: {
        description: 'Adjust darkness of overlay (0 = transparent, 1 = fully black)',
        condition: (data) => data.overlay === true,
      },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small (320px)', value: 'small' },
        { label: 'Medium (384px)', value: 'medium' },
        { label: 'Large (500px)', value: 'large' },
        { label: 'Extra Large (600px)', value: 'xl' },
      ],
      admin: {
        description: 'Choose the height of the image block',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'Call to Action Link (Href)',
      admin: {
        description: 'Optional: Make the entire image clickable by adding a URL (e.g., /contact)',
      },
    },
  ],
};
