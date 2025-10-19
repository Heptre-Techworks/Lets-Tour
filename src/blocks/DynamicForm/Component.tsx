// src/blocks/DynamicForm/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DynamicFormClient } from './Component.client'

export const DynamicForm = async () => {
  const payload = await getPayload({ config: configPromise })
  
  // ✅ Fetch all published packages for the dropdown
  const packagesResult = await payload.find({
    collection: 'packages',
    where: {
      isPublished: { equals: true },
    },
    limit: 500,
    sort: 'name',
    depth: 0,
  })

  // ✅ Transform packages into dropdown options with name and duration
  const packageOptions = packagesResult.docs.map((pkg: any) => ({
    label: `${pkg.name} - ${pkg.duration || 'N/A'} - ₹${pkg.price?.toLocaleString() || 'Contact'}`,
    value: pkg.id,
  }))

  console.log(`✅ Loaded ${packageOptions.length} packages for dropdown`)

  // Booking form configuration
  const bookingFormProps = {
    formType: 'booking' as const,
    title: 'Book Your Dream Vacation',
    subtitle: 'Fill out the form below and we\'ll get back to you within 24 hours',
    packageOptions,  // ✅ Pass packages to client
    fields: [
      // ✅ Package selection with search
      {
        label: 'Select Package',
        name: 'package',
        type: 'select' as const,
        placeholder: 'Choose your package...',
        required: true,
        width: 'full' as const,
        options: packageOptions,
      },
      
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
        width: 'full' as const,
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
        label: 'Travel End Date (Optional)',
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
        label: 'Number of Children (2-12 years)',
        name: 'numberOfPeople.children',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        width: 'third' as const,
      },
      {
        label: 'Number of Infants (0-2 years)',
        name: 'numberOfPeople.infants',
        type: 'number' as const,
        placeholder: '0',
        required: false,
        width: 'third' as const,
      },
      
      // Contact Details
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
        label: 'I agree to the terms and conditions and privacy policy',
        name: 'agreedToTerms',
        type: 'checkbox' as const,
        required: true,
        width: 'full' as const,
      },
    ],
    submitButtonText: 'Submit Booking Request',
    successMessage: 'Thank you for your booking request! We\'ll contact you within 24 hours to confirm your reservation and discuss payment options.',
  }

  return <DynamicFormClient {...bookingFormProps} />
}

export default DynamicForm
