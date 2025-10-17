// src/blocks/DynamicForm/Component.tsx
import React from 'react'
import { DynamicFormClient } from './Component.client'
import type { DynamicFormBlock } from '@/payload-types'

export const DynamicForm = async (props: DynamicFormBlock) => {
  // Clean up all null values to undefined for client component
  const cleanProps = {
    formType: props.formType || 'review',
    title: props.title || 'Get in Touch',
    subtitle: props.subtitle || undefined,
    submitButtonText: props.submitButtonText || 'Submit',
    successMessage: props.successMessage || 'Thank you! We\'ll get back to you soon.',
    fields: (props.fields || []).map((field: any) => ({
      label: field.label || '',
      name: field.name || '',
      type: field.type || 'text',
      placeholder: field.placeholder || undefined,
      required: field.required || false,
      options: field.options || undefined,
      rows: field.rows || undefined,
      width: field.width || 'full',
    })),
  }

  return <DynamicFormClient {...cleanProps} />
}

export default DynamicForm
