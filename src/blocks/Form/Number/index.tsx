import React from 'react'
import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Error } from '../Error'
import { Width } from '../Width'

export const Number: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  return (
    <Width width={width}>
      {/* Label */}
      <Label
        htmlFor={name}
        className="block mb-2 text-sm sm:text-base md:text-lg font-medium text-gray-800"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1">
            * <span className="sr-only">(required)</span>
          </span>
        )}
      </Label>

      {/* Input Field */}
      <Input
        defaultValue={defaultValue}
        id={name}
        type="number"
        placeholder="Enter number"
        {...register(name, { required })}
        className="
          w-full 
          h-11 sm:h-12 
          px-3 sm:px-4 
          text-sm sm:text-base 
          border border-gray-300 
          rounded-md 
          focus:outline-none 
          focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
          placeholder-gray-400
          transition-all
        "
      />

      {/* Error Message */}
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
