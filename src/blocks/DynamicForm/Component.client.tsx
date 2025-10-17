// src/blocks/DynamicForm/Component.client.tsx
'use client';

import React, { useState } from 'react';

type FormField = {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  rows?: number;
  width?: 'full' | 'half' | 'third';
};

type DynamicFormClientProps = {
  formType?: 'review' | 'booking' | 'bulkBooking' | 'customTrip';
  title?: string;
  subtitle?: string;
  fields?: FormField[];
  submitButtonText?: string;
  successMessage?: string;
};

export const DynamicFormClient: React.FC<DynamicFormClientProps> = ({
  formType = 'review',
  title = 'Get in Touch',
  subtitle,
  fields = [],
  submitButtonText = 'Submit',
  successMessage = 'Thank you! We\'ll get back to you soon.',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Determine API endpoint
      const endpoints: Record<string, string> = {
        review: '/api/reviews',
        booking: '/api/bookings',
        bulkBooking: '/api/bulk-booking-requests',
        customTrip: '/api/custom-trip-requests',
      };

      const endpoint = endpoints[formType] || '/api/reviews';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitStatus('success');
      setFormData({});
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWidthClass = (width?: string) => {
    switch (width) {
      case 'half':
        return 'w-full md:w-1/2';
      case 'third':
        return 'w-full md:w-1/3';
      default:
        return 'w-full';
    }
  };

  const renderField = (field: FormField, index: number) => {
    const widthClass = getWidthClass(field.width);
    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

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
              placeholder={field.placeholder}
              className={inputClasses}
            />
          );

        case 'select':
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
            <div className="flex items-center">
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={handleChange}
                required={field.required}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={field.name} className="ml-2 block text-sm text-gray-700">
                {field.label}
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
              placeholder={field.placeholder}
              className={inputClasses}
            />
          );
      }
    })();

    return (
      <div key={index} className={widthClass}>
        {field.type !== 'checkbox' && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {fieldElement}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>

      {submitStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500 mb-4"
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
          <h3 className="text-lg font-semibold text-green-900 mb-2">Success!</h3>
          <p className="text-green-700">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-4">
            {fields.map((field, index) => renderField(field, index))}
          </div>

          {submitStatus === 'error' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </button>
        </form>
      )}
    </div>
  );
};

export default DynamicFormClient;
