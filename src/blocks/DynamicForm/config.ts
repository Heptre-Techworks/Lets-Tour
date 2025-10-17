// src/blocks/DynamicForm/config.ts
import type { Block } from 'payload';

export const DynamicFormBlock: Block = {
  slug: 'dynamicForm',
  interfaceName: 'DynamicFormBlock',
  labels: { singular: 'Dynamic Form', plural: 'Dynamic Forms' },
  fields: [
    {
      name: 'formType',
      type: 'select',
      label: 'Submission Target',
      defaultValue: 'review',
      required: true,
      options: [
        { label: 'Reviews Collection', value: 'review' },
        { label: 'Bookings Collection', value: 'booking' },
        { label: 'Bulk Booking Requests', value: 'bulkBooking' },
        { label: 'Custom Trip Requests', value: 'customTrip' },
      ],
      admin: {
        description: 'Where should form submissions be saved?',
      },
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Get in Touch',
      required: true,
      admin: {
        description: 'Form heading',
      },
    },
    {
      name: 'subtitle',
      type: 'textarea',
      admin: {
        description: 'Optional description below heading',
      },
    },
    {
      name: 'fields',
      type: 'array',
      label: 'Form Fields',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Field',
        plural: 'Fields',
      },
      admin: {
        description: 'Add custom fields to your form',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Field label shown to users',
            placeholder: 'Your Name',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Field name (used for data mapping)',
            placeholder: 'name',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'tel' },
            { label: 'Number', value: 'number' },
            { label: 'Date', value: 'date' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select Dropdown', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
          ],
          admin: {
            description: 'Field input type',
          },
        },
        {
          name: 'placeholder',
          type: 'text',
          admin: {
            description: 'Placeholder text (optional)',
          },
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          label: 'Required Field',
        },
        {
          name: 'options',
          type: 'array',
          label: 'Dropdown Options',
          admin: {
            condition: (_, siblingData) => siblingData.type === 'select',
            description: 'Options for select dropdown',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'rows',
          type: 'number',
          defaultValue: 4,
          min: 2,
          max: 10,
          admin: {
            condition: (_, siblingData) => siblingData.type === 'textarea',
            description: 'Number of rows for textarea',
          },
        },
        {
          name: 'width',
          type: 'select',
          defaultValue: 'full',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Half Width (50%)', value: 'half' },
            { label: 'One Third (33%)', value: 'third' },
          ],
          admin: {
            description: 'Field width in the form',
          },
        },
      ],
    },
    {
      name: 'submitButtonText',
      type: 'text',
      defaultValue: 'Submit',
      admin: {
        description: 'Submit button text',
      },
    },
    {
      name: 'successMessage',
      type: 'textarea',
      defaultValue: 'Thank you! We\'ll get back to you soon.',
      admin: {
        description: 'Success message after submission',
      },
    },
  ],
};

export default DynamicFormBlock;
