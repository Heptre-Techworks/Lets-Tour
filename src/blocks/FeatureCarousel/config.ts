import type { Block } from 'payload';

export const FeatureCarousel: Block = {
  slug: 'featureCarousel',
  interfaceName: 'FeatureCarouselBlock',
  labels: {
    singular: 'Feature Carousel',
    plural: 'Feature Carousels',
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
        description: 'Choose where to load feature cards from',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        condition: (_, siblingData) => siblingData.dataSource === 'package',
        description: 'Select a specific package to display features from',
      },
    },
    {
      name: 'featureSource',
      type: 'select',
      label: 'Feature Source',
      defaultValue: 'highlights',
      options: [
        { label: 'Package Highlights', value: 'highlights' },
        { label: 'Inclusions', value: 'inclusions' },
        { label: 'Activities', value: 'activities' },
        { label: 'Amenities', value: 'amenities' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData.dataSource !== 'manual',
        description: 'Choose which package data to display as feature cards',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Discover Our Features',
      admin: {
        description: 'Main heading displayed at the top of the carousel. Use {name} for package name replacement.',
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Subheading',
      defaultValue: 'Explore the powerful tools that make our platform the best choice for you.',
      admin: {
        description: 'Optional subheading displayed below the main heading.',
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Feature Cards',
      minRows: 1,
      maxRows: 20,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: {
        description: 'Add feature cards to display in the scrollable carousel.',
        initCollapsed: false,
        condition: (_, siblingData) => siblingData.dataSource === 'manual',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
          admin: {
            placeholder: 'e.g., Customizable reporting',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
          admin: {
            placeholder: 'Enter a detailed description of this feature...',
            rows: 4,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showNavigationButtons',
          type: 'checkbox',
          label: 'Show Navigation Buttons',
          defaultValue: true,
          admin: {
            description: 'Display left/right navigation buttons for manual scrolling.',
          },
        },
        {
          name: 'scrollPercentage',
          type: 'number',
          label: 'Scroll Percentage',
          defaultValue: 80,
          min: 10,
          max: 100,
          admin: {
            description: 'Percentage of container width to scroll on button click (10-100).',
            condition: (data) => data.showNavigationButtons === true,
          },
        },
      ],
    },
  ],
};

export default FeatureCarousel;
