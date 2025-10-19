// src/blocks/DynamicForm/Component.client.tsx
'use client';

import React, { useState } from 'react';

type FormField = {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string | null;
  required?: boolean;
  options?: Array<{ label: string; value: string }> | null;
  rows?: number | null;
  width?: 'full' | 'half' | 'third' | null;
};

type DynamicFormClientProps = {
  formType?: 'review' | 'booking' | 'bulkBooking' | 'customTrip';
  title?: string;
  subtitle?: string;
  fields?: FormField[];
  submitButtonText?: string;
  successMessage?: string;
  packageOptions?: Array<{ label: string; value: string }>;
};

export const DynamicFormClient: React.FC<DynamicFormClientProps> = ({
  formType = 'review',
  title = 'Get in Touch',
  subtitle,
  fields = [],
  submitButtonText = 'Submit',
  successMessage = "Thank you! We'll get back to you soon.",
  packageOptions = [],
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const transformFormData = (data: Record<string, any>, type: string) => {
    const transformed: Record<string, any> = {};

    // Handle nested fields
    Object.entries(data).forEach(([key, value]) => {
      if (key.includes('.')) {
        const parts = key.split('.');
        const parentKey = parts[0];
        const childKey = parts.slice(1).join('.');

        if (!transformed[parentKey]) {
          transformed[parentKey] = {};
        }

        if (childKey.includes('.')) {
          const childParts = childKey.split('.');
          let current = transformed[parentKey];
          for (let i = 0; i < childParts.length - 1; i++) {
            if (!current[childParts[i]]) {
              current[childParts[i]] = {};
            }
            current = current[childParts[i]];
          }
          current[childParts[childParts.length - 1]] = value;
        } else {
          transformed[parentKey][childKey] = value;
        }
      } else {
        transformed[key] = value;
      }
    });

    // Convert number strings to numbers
    Object.entries(transformed).forEach(([key, value]) => {
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        if (['price', 'amount', 'rating', 'adults', 'children', 'infants', 'people', 'total'].some(keyword => key.toLowerCase().includes(keyword))) {
          transformed[key] = Number(value);
        }
      }
    });

    // Booking-specific defaults
    if (type === 'booking') {
      if (!transformed.totalPrice) transformed.totalPrice = 0;
      if (!transformed.paidAmount) transformed.paidAmount = 0;
      if (!transformed.currency) transformed.currency = 'INR';
      if (!transformed.status) transformed.status = 'pending';
      if (!transformed.paymentStatus) transformed.paymentStatus = 'pending';
      if (!transformed.bookingDate) transformed.bookingDate = new Date().toISOString();
      
      if (transformed.numberOfPeople && typeof transformed.numberOfPeople === 'object') {
        transformed.numberOfPeople = {
          adults: Number(transformed.numberOfPeople.adults) || 1,
          children: Number(transformed.numberOfPeople.children) || 0,
          infants: Number(transformed.numberOfPeople.infants) || 0,
        };
      }
    }

    return transformed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    console.log('📤 Raw form data:', formData)

    try {
      const collectionMap: Record<string, string> = {
        review: 'reviews',
        booking: 'bookings',
        bulkBooking: 'bulk-booking-requests',
        customTrip: 'custom-trip-requests',
      };

      const collection = collectionMap[formType] || 'reviews';
      const endpoint = `/api/${collection}`;

      const transformedData = transformFormData(formData, formType);
      
      console.log('🔄 Transformed data:', JSON.stringify(transformedData, null, 2))
      console.log('🎯 Posting to:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const responseData = await response.json();
      console.log('📥 Response:', responseData)

      if (!response.ok) {
        const errorDetails = responseData.errors?.map((err: any) => `${err.field || 'Field'}: ${err.message}`).join(', ') || responseData.message || 'Submission failed';
        throw new Error(errorDetails);
      }

      setSubmitStatus('success');
      setFormData({});
      setSearchQuery('');
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWidthClass = (width?: string | null) => {
    switch (width) {
      case 'half':
        return 'w-full md:w-1/2 px-2';
      case 'third':
        return 'w-full md:w-1/3 px-2';
      default:
        return 'w-full px-2';
    }
  };

  const renderField = (field: FormField, index: number) => {
    const widthClass = getWidthClass(field.width);
    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

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
              className={inputClasses}
            />
          );

        case 'select':
          // Enhanced select with search for package field
          if (field.name === 'package' && packageOptions.length > 0) {
            const filteredOptions = packageOptions.filter(opt =>
              opt.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="🔍 Search packages by name, duration, or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClasses} bg-gray-50`}
                />
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className={`${inputClasses} ${!formData[field.name] ? 'text-gray-400' : 'text-gray-900'}`}
                  size={Math.min(filteredOptions.length + 1, 8)}
                >
                  <option value="">-- Select a package --</option>
                  {filteredOptions.map((option, idx) => (
                    <option key={idx} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
                {filteredOptions.length === 0 && searchQuery && (
                  <p className="text-sm text-red-500">No packages found matching &quot;{searchQuery}&quot;</p>
                )}
                {filteredOptions.length > 0 && (
                  <p className="text-xs text-gray-500">Showing {filteredOptions.length} of {packageOptions.length} packages</p>
                )}
              </div>
            );
          }

          // Regular select
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
          );

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
              <label htmlFor={`field-${index}`} className="ml-3 block text-sm text-gray-700 cursor-pointer">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          );

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
          );
      }
    })();

    return (
      <div key={index} className={`${widthClass} mb-4`}>
        {field.type !== 'checkbox' && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {fieldElement}
      </div>
    );
  };

  if (!fields || fields.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4">⚠️ No Form Fields Configured</h2>
        <p className="text-yellow-800">
          Please add fields to this form in the Payload admin panel.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-green-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-2xl font-semibold text-green-900 mb-2">Success!</h3>
          <p className="text-lg text-green-700">{successMessage}</p>
          <button
            onClick={() => {
              setSubmitStatus('idle');
              setSearchQuery('');
            }}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit Another Booking
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap -mx-2">
            {fields.map((field, index) => renderField(field, index))}
          </div>

          {submitStatus === 'error' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-bold text-red-900 mb-1">Submission Error</div>
                  <p className="text-red-700 text-sm whitespace-pre-wrap">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
  );
};

export default DynamicFormClient;
