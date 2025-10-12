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
      name: 'heading',
      type: 'text',
      label: 'Heading',
      defaultValue: 'Discover Our Features',
      required: true,
      admin: {
        description: 'Main heading displayed at the top of the carousel.',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Subheading',
      defaultValue: 'Explore the powerful tools that make our platform the best choice for you.',
      admin: {
        description: 'Optional subheading displayed below the main heading.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Feature Cards',
      required: true,
      minRows: 1,
      maxRows: 20,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: {
        description: 'Add feature cards to display in the scrollable carousel.',
        initCollapsed: false,
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
