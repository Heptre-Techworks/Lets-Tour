import type { Block } from 'payload';

export const HeaderPoints: Block = {
  slug: 'headerPoints',
  interfaceName: 'HeaderPointsBlock',
  labels: {
    singular: 'Header Points',
    plural: 'Header Points',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Heading',
      required: true,
      admin: {
        description: 'Main heading displayed at the top.',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      defaultValue: 'This is a subheading.',
      admin: {
        description: 'Optional subheading displayed below the main heading. Leave empty to hide.',
        rows: 2,
      },
    },
    {
      name: 'listStyle',
      type: 'select',
      label: 'List Style',
      defaultValue: 'decimal',
      options: [
        {
          label: 'Numbered (1, 2, 3...)',
          value: 'decimal',
        },
        {
          label: 'Bullet Points',
          value: 'disc',
        },
      ],
      admin: {
        description: 'Choose how the list items should be displayed.',
      },
    },
    {
      name: 'points',
      type: 'array',
      label: 'Points',
      required: true,
      minRows: 1,
      maxRows: 50,
      labels: {
        singular: 'Point',
        plural: 'Points',
      },
      admin: {
        description: 'Add points or items to display in the list.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Point Text',
          required: true,
          admin: {
            placeholder: 'e.g., Enter your point here...',
            rows: 3,
          },
        },
      ],
    },
  ],
};

export default HeaderPoints;
