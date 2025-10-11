import type { Block } from 'payload';

export const PopularNow: Block = {
  slug: 'popularNow',
  interfaceName: 'PopularNowBlock',
  labels: { singular: 'Popular Now', plural: 'Popular Now' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Popular now!' },
    { name: 'subheading', type: 'text', defaultValue: "Today’s enemy is tomorrow’s friend." },
    { name: 'pauseOnHover', type: 'checkbox', defaultValue: true },
    {
      name: 'rows',
      type: 'array',
      required: true,
      labels: { singular: 'Row', plural: 'Rows' },
      fields: [
        {
          name: 'direction',
          type: 'select',
          options: [
            { value: 'left', label: 'Left (default)' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'left',
          admin: { description: 'Scroll direction for this row.' },
        },
        {
          name: 'speedSeconds',
          type: 'number',
          label: 'Speed (seconds for loop)',
          defaultValue: 40,
          min: 10,
          max: 200,
          admin: { description: 'How many seconds should a full loop take?' },
        },
        {
          name: 'cards',
          type: 'array',
          required: true,
          labels: { singular: 'Destination Card', plural: 'Destination Cards' },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'image',
                  label: 'Image (upload)',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'imageUrl',
                  label: 'Image (external URL)',
                  type: 'text',
                  admin: { description: 'Optional external image URL.' },
                },
                { name: 'alt', type: 'text', admin: { description: 'Image alt text.' } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default PopularNow;
