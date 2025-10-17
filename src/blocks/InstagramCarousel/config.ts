// src/blocks/InstagramCarousel/config.ts
import type { Block } from 'payload';

export const InstagramCarouselBlock: Block = {
  slug: 'instagramCarousel',
  interfaceName: 'InstagramCarouselBlock',
  labels: { singular: 'Instagram Carousel', plural: 'Instagram Carousels' },
  imageAltText: 'Instagram Carousel',
  fields: [
    {
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Featured Posts', value: 'featured' },
        { label: 'Recent Posts', value: 'recent' },
      ],
      admin: {
        description: 'Choose where to load Instagram posts from',
      },
    },
    {
      name: 'postLimit',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource !== 'manual',
        description: 'Number of posts to display',
      },
    },

    // Manual posts
    {
      name: 'posts',
      type: 'array',
      labels: { singular: 'Post', plural: 'Posts' },
      minRows: 1,
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (val: unknown) => {
            const v = String(val || '');
            const ok = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/.test(v);
            return ok || 'Provide a valid Instagram post URL';
          },
        },
        {
          name: 'captioned',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show caption for this post',
          },
        },
      ],
    },

    // Header section
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Latest on Instagram',
      admin: {
        description: 'Section heading',
      },
    },
    {
      name: 'profile',
      type: 'group',
      label: 'Instagram Profile',
      fields: [
        { name: 'handle', type: 'text', label: 'Handle (e.g., @yourbrand)' },
        { 
          name: 'profileUrl', 
          type: 'text',
          label: 'Profile URL',
          admin: {
            placeholder: 'https://instagram.com/yourbrand',
          },
        },
        { 
          name: 'followLabel', 
          type: 'text', 
          defaultValue: 'Follow us',
        },
        {
          name: 'avatarUrl',
          type: 'upload',
          relationTo: 'media',
          label: 'Profile Avatar',
        },
      ],
    },

    // Layout settings
    {
      name: 'layout',
      type: 'group',
      label: 'Grid Layout',
      fields: [
        { 
          name: 'columnsDesktop', 
          type: 'number', 
          defaultValue: 4, 
          min: 1, 
          max: 8,
          label: 'Columns (Desktop)',
        },
        { 
          name: 'columnsTablet', 
          type: 'number', 
          defaultValue: 3, 
          min: 1, 
          max: 6,
          label: 'Columns (Tablet)',
        },
        { 
          name: 'columnsMobile', 
          type: 'number', 
          defaultValue: 2, 
          min: 1, 
          max: 4,
          label: 'Columns (Mobile)',
        },
        { 
          name: 'gutter', 
          type: 'text', 
          defaultValue: '12px',
          admin: {
            description: 'Space between posts (e.g., 12px, 1rem)',
          },
        },
        { 
          name: 'showCaptions', 
          type: 'checkbox', 
          defaultValue: false,
          label: 'Show Captions Globally',
          admin: {
            description: 'Show Instagram captions on all posts',
          },
        },
      ],
    },

    // Optional caption
    { 
      name: 'caption', 
      type: 'richText',
      label: 'Bottom Caption',
      admin: {
        description: 'Optional text below the grid',
      },
    },
  ],
};

export default InstagramCarouselBlock;
