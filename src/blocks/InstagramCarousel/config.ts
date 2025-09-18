// src/payload/blocks/InstagramCarouselBlock.ts
import type { Block } from 'payload';

export const InstagramCarouselBlock: Block = {
  slug: 'instagramCarousel',
  interfaceName: 'InstagramCarouselBlock',
  labels: { singular: 'Instagram Carousel', plural: 'Instagram Carousels' },
  imageAltText: 'Instagram Carousel',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: false,
      admin: { description: 'E.g., "Latest on Instagram"' },
    },
    {
      name: 'profile',
      type: 'group',
      fields: [
        { name: 'handle', type: 'text', required: false },
        { name: 'profileUrl', type: 'text', required: false },
        { name: 'followLabel', type: 'text', defaultValue: 'Follow us' },
      ],
      admin: { description: 'Optional header with a follow button' },
    },
    {
      name: 'layout',
      type: 'group',
      fields: [
        { name: 'columnsDesktop', type: 'number', defaultValue: 4, min: 1, max: 8 },
        { name: 'columnsTablet', type: 'number', defaultValue: 3, min: 1, max: 6 },
        { name: 'columnsMobile', type: 'number', defaultValue: 2, min: 1, max: 4 },
        { name: 'gutter', type: 'text', defaultValue: '12px' },
        { name: 'showCaptions', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'posts',
      type: 'array',
      required: true,
      labels: { singular: 'Post', plural: 'Posts' },
      minRows: 1,
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (val: unknown) => {
            const v = String(val || '');
            const ok = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/.test(v);
            return ok || 'Provide a valid Instagram post URL (post, reel, or TV).';
          },
        },
        {
          name: 'captioned',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Force captions for this post only' },
        },
      ],
    },
    // Optional rich text caption under the grid
    { name: 'caption', type: 'richText', required: false },
  ],
};
export default InstagramCarouselBlock;
