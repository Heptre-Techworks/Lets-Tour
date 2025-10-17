// src/blocks/TravelPackageExplorer/config.ts
import type { Block } from 'payload';

export const TravelPackageExplorer: Block = {
  slug: 'travelPackageExplorer',
  interfaceName: 'TravelPackageExplorerBlock',
  labels: {
    singular: 'Travel Package Explorer',
    plural: 'Travel Package Explorers',
  },
  fields: [
    {
      name: 'dataSource',
      type: 'select',
      label: 'Data Source',
      defaultValue: 'auto',
      required: true,
      options: [
        { label: 'Auto (from URL slug)', value: 'auto' },
        { label: 'Select Destination', value: 'destination' },
        { label: 'All Packages', value: 'all' },
      ],
      admin: {
        description: 'Auto detects destination from URL slug',
      },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'destination',
      },
    },
  ],
};

export default TravelPackageExplorer;
