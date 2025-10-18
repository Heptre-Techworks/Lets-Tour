// src/blocks/DynamicForm/Component.tsx
import React from 'react'
import { DynamicFormClient } from './Component.client'

export const DynamicForm = async () => {
  // Hardcoded booking form fields
  const bookingFormProps = {
    formType: 'booking' as const,
    title: 'Book Your Dream Vacation',
    subtitle: 'Fill out the form below and we\'ll get back to you within 24 hours',
    fields: [
      // Personal Details
      {
        label: 'Full Name',
        name: 'guestName',
        type: 'text' as const,
        placeholder: 'Enter your full name',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Email Address',
        name: 'guestEmail',
        type: 'email' as const,
        placeholder: 'your.email@example.com',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Phone Number',
        name: 'guestPhone',
        type: 'tel' as const,
        placeholder: '+91 98765 43210',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Package ID',
        name: 'package',
        type: 'text' as const,
        placeholder: 'Enter package ID (e.g., 6789...)',
        required: true,
        width: 'half' as const,
      },
      
      // Trip Details
      {
        label: 'Travel Start Date',
        name: 'startDate',
        type: 'date' as const,
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Travel End Date',
        name: 'endDate',
        type: 'date' as const,
        required: false,
        width: 'half' as const,
      },
      
      // Number of People
      {
        label: 'Number of Adults',
        name: 'numberOfPeople.adults',
        type: 'number' as const,
        placeholder: '2',
        required: true,
        width: 'third' as const,
      },
      {
        label: 'Number of Children',
        name: 'numberOfPeople.children',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        width: 'third' as const,
      },
      {
        label: 'Number of Infants',
        name: 'numberOfPeople.infants',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        width: 'third' as const,
      },
      
      // Contact Details (nested)
      {
        label: 'Contact Phone',
        name: 'contactDetails.phone',
        type: 'tel' as const,
        placeholder: '+91 98765 43210',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Contact Email',
        name: 'contactDetails.email',
        type: 'email' as const,
        placeholder: 'contact@example.com',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Address (Optional)',
        name: 'contactDetails.address',
        type: 'textarea' as const,
        placeholder: 'Your full address',
        required: false,
        rows: 3,
        width: 'full' as const,
      },
      
      // Pricing
      {
        label: 'Total Price (₹)',
        name: 'totalPrice',
        type: 'number' as const,
        placeholder: '50000',
        required: true,
        width: 'half' as const,
      },
      {
        label: 'Currency',
        name: 'currency',
        type: 'select' as const,
        required: true,
        width: 'half' as const,
        options: [
          { label: '₹ INR', value: 'INR' },
          { label: '$ USD', value: 'USD' },
          { label: '€ EUR', value: 'EUR' },
          { label: '£ GBP', value: 'GBP' },
        ],
      },
      
      // Special Requests
      {
        label: 'Special Requests / Dietary Requirements',
        name: 'specialRequests',
        type: 'textarea' as const,
        placeholder: 'Any special requirements, dietary restrictions, or preferences...',
        required: false,
        rows: 4,
        width: 'full' as const,
      },
      
      // Terms & Conditions
      {
        label: 'I agree to the terms and conditions',
        name: 'agreedToTerms',
        type: 'checkbox' as const,
        required: true,
        width: 'full' as const,
      },
    ],
    submitButtonText: 'Submit Booking Request',
    successMessage: 'Thank you for your booking request! We\'ll contact you within 24 hours to confirm your reservation.',
  }

  return <DynamicFormClient {...bookingFormProps} />
}

export default DynamicForm
