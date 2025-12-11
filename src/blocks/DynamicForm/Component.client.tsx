// src/blocks/DynamicForm/Component.client.tsx
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import emailjs from '@emailjs/browser' // 1. 🛠️ Import EmailJS

// --- EmailJS Configuration ---
const EMAILJS_SERVICE_ID = 'Lets-Tour-Demo'
const EMAILJS_TEMPLATE_ID = 'template_154333w'
const EMAILJS_PUBLIC_KEY = '7KpM1U3hexIGQWnuc' // User ID is the Public Key
// ---

type FormField = {
  label: string
  name: string
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string | null
  required?: boolean
  options?: Array<{ label: string; value: string }> | null
  rows?: number | null
  width?: 'full' | 'half' | 'third' | null
}

type DynamicFormClientProps = {
  formType?: 'review' | 'booking' | 'bulkBooking' | 'customTrip'
  title?: string
  subtitle?: string
  fields?: FormField[]
  submitButtonText?: string
  successMessage?: string
  packageOptions?: Array<{ label: string; value: string }>
}

export const DynamicFormClient: React.FC<DynamicFormClientProps> = ({
  formType = 'review',
  title = 'Get in Touch',
  subtitle,
  fields = [],
  submitButtonText = 'Submit',
  successMessage = "Thank thank you! We'll get back to you soon.",
  packageOptions = [],
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // 2. 🚀 Initialize EmailJS on component mount
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY)
  }, [])

  const getSelectedPackageOption = (value: string) => {
    return packageOptions.find((opt) => opt.value === value)
  }

  const selectedPackageOption = useMemo(() => {
    const packageValue = formData['package']
    return packageValue ? getSelectedPackageOption(packageValue) : undefined
  }, [formData, packageOptions])

  useEffect(() => {
    if (selectedPackageOption && isDropdownOpen) {
      setIsDropdownOpen(false)
      setSearchQuery('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageOption])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const transformFormData = (data: Record<string, any>, type: string) => {
    const transformed: Record<string, any> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (key.includes('.')) {
        const parts = key.split('.')
        const parentKey = parts[0]
        const childKey = parts.slice(1).join('.')

        if (!transformed[parentKey]) transformed[parentKey] = {}
        transformed[parentKey][childKey] = value
      } else {
        transformed[key] = value
      }
    })

    Object.entries(transformed).forEach(([key, value]) => {
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        if (
          ['price', 'amount', 'rating', 'adults', 'children', 'infants', 'people', 'total'].some(
            (keyword) => key.toLowerCase().includes(keyword),
          )
        ) {
          transformed[key] = Number(value)
        }
      }
    })

    if (type === 'booking') {
      if (!transformed.totalPrice) transformed.totalPrice = 0
      if (!transformed.paidAmount) transformed.paidAmount = 0
      if (!transformed.currency) transformed.currency = 'INR'
      if (!transformed.status) transformed.status = 'pending'
      if (!transformed.paymentStatus) transformed.paymentStatus = 'pending'
      if (!transformed.bookingDate) transformed.bookingDate = new Date().toISOString()

      if (transformed.numberOfPeople && typeof transformed.numberOfPeople === 'object') {
        transformed.numberOfPeople = {
          adults: Number(transformed.numberOfPeople.adults) || 1,
          children: Number(transformed.numberOfPeople.children) || 0,
          infants: Number(transformed.numberOfPeople.infants) || 0,
        }
      }
    }

    return transformed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    const transformedData = transformFormData(formData, formType)

    try {
      // 1. Submit to API/Database (Original Logic)
      const collectionMap: Record<string, string> = {
        review: 'reviews',
        booking: 'bookings',
        bulkBooking: 'bulk-booking-requests',
        customTrip: 'custom-trip-requests',
      }

      const collection = collectionMap[formType] || 'reviews'
      const endpoint = `/api/${collection}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorDetails =
          responseData.errors
            ?.map((err: any) => `${err.field || 'Field'}: ${err.message}`)
            .join(', ') ||
          responseData.message ||
          'Submission failed'
        throw new Error(errorDetails)
      }

      // 2. 📧 Send Email via EmailJS (New Logic)
      // Note: We use the raw formData for the email template as transformedData might be nested/complex.
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          ...formData, // Send raw form data for template variables
          form_type: formType,
          // You might add a custom field for the recipient email if required by the template
          // recipient_email: formData.email,
        })
      } catch (emailError) {
        // Log the email error but don't stop the form success flow
        // if the API submission was already successful.
        console.error('EmailJS failed to send:', emailError)
        // Optionally, you could set a specific success message mentioning the email issue.
      }

      // 3. Cleanup and Success State
      setSubmitStatus('success')
      setFormData({})
      setSearchQuery('')
      setIsDropdownOpen(false)
    } catch (error: any) {
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWidthClass = (width?: string | null) => {
    switch (width) {
      case 'half':
        return 'w-full sm:w-1/2 px-2'
      case 'third':
        return 'w-full md:w-1/3 px-2'
      default:
        return 'w-full px-2'
    }
  }

  const renderField = (field: FormField, index: number) => {
    const widthClass = getWidthClass(field.width)
    const inputClasses =
      'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base'

    const fieldElement = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              rows={field.rows || 4}
              placeholder={field.placeholder || undefined}
              className={`${inputClasses} resize-y py-3`}
            />
          )

        case 'select':
          if (field.name === 'package' && packageOptions.length > 0) {
            const filteredOptions = packageOptions.filter((opt) =>
              opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
            )

            return (
              <div className="relative space-y-2">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="🔍 Search packages..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={!!selectedPackageOption && !isDropdownOpen}
                  className={`${inputClasses} bg-gray-50 disabled:cursor-not-allowed disabled:opacity-75`}
                />

                {/* Selected Package Display */}
                {selectedPackageOption && !isDropdownOpen && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm sm:text-base text-blue-900 font-medium">
                      {selectedPackageOption.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, [field.name]: '' }))
                        setSearchQuery('')
                        setIsDropdownOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div className="relative">
                    <div className="absolute z-10 w-full max-h-60 sm:max-h-80 overflow-y-auto overflow-x-hidden bg-white border border-gray-300 rounded-lg shadow-lg">
                      {filteredOptions.length > 0 ? (
                        <>
                          <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 border-b">
                            {filteredOptions.length} package
                            {filteredOptions.length !== 1 ? 's' : ''} found
                          </div>
                          {filteredOptions.map((option, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, [field.name]: option.value }))
                              }}
                              className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base hover:bg-blue-50 transition-colors whitespace-nowrap ${
                                formData[field.name] === option.value
                                  ? 'bg-blue-100 font-semibold text-blue-900'
                                  : 'text-gray-800'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm sm:text-base text-gray-500">No packages found</p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Try adjusting your search
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Close dropdown overlay */}
                    <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />
                  </div>
                )}

                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  name={field.name}
                  value={formData[field.name] || ''}
                  required={field.required}
                />
              </div>
            )
          }

          return (
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              className={inputClasses}
            >
              <option value="">Select...</option>
              {(field.options || []).map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )

        case 'checkbox':
          return (
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name={field.name}
                id={`field-${index}`}
                checked={formData[field.name] || false}
                onChange={handleChange}
                required={field.required}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor={`field-${index}`}
                className="ml-3 text-sm sm:text-base text-gray-700 cursor-pointer"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          )

        default:
          return (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder || undefined}
              className={inputClasses}
            />
          )
      }
    })()

    return (
      <div key={index} className={`${widthClass} mb-4`}>
        {field.type !== 'checkbox' && (
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {fieldElement}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white rounded-xl shadow-lg">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">{title}</h2>
        {subtitle && <p className="text-base sm:text-lg text-gray-600">{subtitle}</p>}
      </div>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-7 text-center">
          <svg
            className="mx-auto h-12 w-12 sm:h-14 sm:w-14 text-green-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-xl sm:text-2xl font-semibold text-green-900 mb-2">Success!</h3>
          <p className="text-base sm:text-lg text-green-700">{successMessage}</p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="mt-5 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap -mx-2">
            {fields.map((field, index) => renderField(field, index))}
          </div>

          {submitStatus === 'error' && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-sm sm:text-base">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-0.5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-bold text-red-900 mb-1">Submission Error</div>
                  <p className="text-red-700 whitespace-pre-wrap">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              submitButtonText
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default DynamicFormClient
