import type { Block } from 'payload';

export const InfoPanel: Block = {
  slug: 'infoPanel',
  interfaceName: 'InfoPanelBlock',
  labels: {
    singular: 'Info Panel',
    plural: 'Info Panels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Panel Title',
      defaultValue: 'Good to Know',
      required: true,
      admin: {
        description: 'Main title displayed at the top of the panel.',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
      admin: {
        description: 'Optional subheading text displayed below the title. Leave empty to hide.',
        rows: 2,
      },
    },
    {
      name: 'listType',
      type: 'select',
      label: 'List Type',
      defaultValue: 'disc',
      options: [
        {
          label: 'Bullet Points',
          value: 'disc',
        },
        {
          label: 'Numbered (1, 2, 3...)',
          value: 'decimal',
        },
      ],
      admin: {
        description: 'Choose how the list items should be displayed.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Information Items',
      required: true,
      minRows: 1,
      maxRows: 20,
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      admin: {
        description: 'Add information items to display in the list.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Item Text',
          required: true,
          admin: {
            placeholder: 'e.g., Please note hotels provided shall be located in outskirts of cities...',
            rows: 3,
          },
        },
      ],
    },
  ],
};

export default InfoPanel;
