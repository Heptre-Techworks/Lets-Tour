import type { Block } from 'payload';

export const PopularNow: Block = {
  slug: 'popularNow',
  interfaceName: 'PopularNowBlock',
  labels: { singular: 'Popular Now', plural: 'Popular Now' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Popular now!',
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.",
    },
    {
      name: 'pauseOnHover',
      type: 'checkbox',
      defaultValue: true,
    },

    // ✅ ROWS AS TOP-LEVEL ARRAY (like your stops example)
    {
      name: 'rows',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      required: true,
      labels: { singular: 'Row', plural: 'Rows' },
      fields: [
        {
          name: 'dataSource',
          type: 'select',
          label: 'Data Source',
          defaultValue: 'featured-destinations',
          required: true,
          options: [
            { label: 'Manual Entry', value: 'manual' },
            { label: '⭐ Featured Destinations', value: 'featured-destinations' },
            { label: '🔥 Popular Destinations', value: 'popular-destinations' },
            { label: '🌸 In Season Destinations', value: 'in-season-destinations' },
            { label: '⭐ Featured Packages', value: 'featured-packages' },
            { label: '🆕 Recent Packages', value: 'recent-packages' },
            { label: '💑 Honeymoon Packages', value: 'honeymoon-packages' },
            { label: '👨‍👩‍👧‍👦 Family Packages', value: 'family-packages' },
          ],
          admin: {
            description: 'Choose data source for this row',
          },
        },
        {
          name: 'itemLimit',
          type: 'number',
          defaultValue: 10,
          required: true,
          min: 1,
          max: 50,
          admin: {
            condition: (_, siblingData) => siblingData?.dataSource !== 'manual',
            description: 'Number of items to display',
          },
        },
        {
          name: 'direction',
          type: 'select',
          required: true,
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'left',
          admin: {
            description: 'Scroll direction',
          },
        },
        {
          name: 'speedSeconds',
          type: 'number',
          label: 'Speed (seconds)',
          defaultValue: 40,
          required: true,
          min: 10,
          max: 200,
          admin: {
            description: 'Animation speed',
          },
        },
        // ✅ CARDS AS NESTED ARRAY (like stops in your example)
        {
          name: 'cards',
          type: 'array',
          minRows: 1,
          maxRows: 20,
          labels: { singular: 'Card', plural: 'Cards' },
          admin: {
            condition: (_, siblingData) => siblingData?.dataSource === 'manual',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'price',
              type: 'text',
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'alt',
              type: 'text',
              admin: {
                description: 'Alt text for accessibility',
              },
            },
          ],
        },
      ],
    },
  ],
};

export default PopularNow;
