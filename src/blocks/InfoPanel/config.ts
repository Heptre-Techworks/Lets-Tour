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
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Auto (from URL)', value: 'auto' },
        { label: 'Select Package', value: 'package' },
      ],
      admin: {
        description: 'Choose where to load panel data from',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'package',
        description: 'Select a specific package',
      },
    },
    {
      name: 'panelType',
      type: 'select',
      label: 'Panel Type',
      defaultValue: 'goodToKnow',
      options: [
        { label: 'Good to Know', value: 'goodToKnow' },
        { label: 'Inclusions', value: 'inclusions' },
        { label: 'Exclusions', value: 'exclusions' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.dataSource !== 'manual',
        description: 'Choose which package data to display',
      },
    },

    // Manual fields
    {
      name: 'title',
      type: 'text',
      label: 'Panel Title',
      defaultValue: 'Good to Know',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
    },
    {
      name: 'subheading',
      type: 'richText',
      label: 'Subheading',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      hooks: {
        afterRead: [
          ({ value }) => {
            if (typeof value === 'string') {
              return {
                root: {
                  type: 'root',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [
                    {
                      type: 'paragraph',
                      format: '',
                      indent: 0,
                      version: 1,
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: value,
                          type: 'text',
                          version: 1,
                        },
                      ],
                    },
                  ],
                },
              };
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'listType',
      type: 'select',
      label: 'List Type',
      defaultValue: 'disc',
      options: [
        { label: 'Bullet Points', value: 'disc' },
        { label: 'Numbered (1, 2, 3...)', value: 'decimal' },
      ],
      admin: {
        description: 'Choose list style for displaying items',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Information Items',
      minRows: 1,
      maxRows: 20,
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      fields: [
        {
          name: 'text',
          type: 'richText',
          label: 'Item Text',
          required: true,
          hooks: {
            afterRead: [
              ({ value }) => {
                if (typeof value === 'string') {
                  return {
                    root: {
                      type: 'root',
                      format: '',
                      indent: 0,
                      version: 1,
                      children: [
                        {
                          type: 'paragraph',
                          format: '',
                          indent: 0,
                          version: 1,
                          children: [
                            {
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: value,
                              type: 'text',
                              version: 1,
                            },
                          ],
                        },
                      ],
                    },
                  };
                }
                return value;
              },
            ],
          },
        },
      ],
    },
  ],
};

export default InfoPanel;
