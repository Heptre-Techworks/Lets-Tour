// src/blocks/UpDownCarousel/config.ts
import type { Block } from 'payload';

export const UpDownCardCarousel: Block = {
  slug: 'upDownCardCarousel',
  interfaceName: 'UpDownCardCarouselBlock',
  labels: { singular: 'Up Down Carousel', plural: 'Up Down Carousel' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'In Season' },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.*",
      admin: { description: 'Optional tagline shown under the heading.' },
    },
    {
      name: 'cards',
      type: 'array',
      required: true,
      labels: { singular: 'Destination Card', plural: 'Destination Cards' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'details', type: 'text' },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { step: 1, description: 'Price in INR.' },
        },
        { name: 'discount', type: 'text' },
        {
          type: 'row',
          fields: [
            {
              name: 'image',
              label: 'Image (upload)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Select from Media collection.' },
            },
            {
              name: 'imageUrl',
              label: 'Image (external URL)',
              type: 'text',
              admin: { description: 'Optional external image URL.' },
            },
          ],
        },
        { name: 'alt', type: 'text', admin: { description: 'Image alt text.' } },
      ],
    },
  ],
};

export default UpDownCardCarousel;
