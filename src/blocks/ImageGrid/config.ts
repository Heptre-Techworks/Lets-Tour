// src/blocks/ImageGrid/config.ts
import type { Block } from 'payload';

export const ImageGrid: Block = {
  slug: 'imageGrid',
  interfaceName: 'ImageGridBlock',
  labels: { singular: 'Image Grid', plural: 'Image Grids' },
  imageAltText: 'Grid of destination images',
  fields: [
    {
      name: 'leftHero',
      type: 'group',
      label: 'Left Hero',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'rating', type: 'number', min: 0, max: 5, admin: { step: 0.1 } },
        { name: 'trail', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'image', label: 'Hero (upload)', type: 'upload', relationTo: 'media' },
            { name: 'imageUrl', label: 'Hero (external URL)', type: 'text' },
          ],
        },
        { name: 'alt', type: 'text' },
      ],
    },

    {
      name: 'explore',
      type: 'group',
      label: 'Explore Card',
      fields: [
        { name: 'subtitle', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'button',
          type: 'group',
          label: 'Button',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },

    {
      name: 'spots',
      type: 'array',
      label: 'Spots (Right Grid)',
      labels: { singular: 'Spot', plural: 'Spots' },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'rating', type: 'number', min: 0, max: 5, admin: { step: 0.1 } },
        { name: 'location', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'image', label: 'Spot (upload)', type: 'upload', relationTo: 'media' },
            { name: 'imageUrl', label: 'Spot (external URL)', type: 'text' },
          ],
        },
        { name: 'alt', type: 'text' },
      ],
    },

    {
      name: 'activities',
      type: 'group',
      label: 'Bottom Activities Banner',
      fields: [
        { name: 'subtitle', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'button',
          type: 'group',
          label: 'Button',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
        { name: 'tag', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'image', label: 'Activities (upload)', type: 'upload', relationTo: 'media' },
            { name: 'imageUrl', label: 'Activities (external URL)', type: 'text' },
          ],
        },
        { name: 'alt', type: 'text' },
      ],
    },

    {
      name: 'labels',
      type: 'group',
      label: 'UI Labels',
      admin: { description: 'Optional symbols or labels so even icons/markers can be editor-controlled.' },
      fields: [
        { name: 'ratingPrefix', type: 'text' }, // e.g., "★ "
      ],
    },

    {
      name: 'theme',
      type: 'group',
      label: 'Theme',
      fields: [
        { name: 'dark', type: 'checkbox' },
        { name: 'container', type: 'checkbox', label: 'Wrap in .container' },
      ],
    },
  ],
};

export default ImageGrid;
