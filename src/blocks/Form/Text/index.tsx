import React from 'react'
import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Error } from '../Error'
import { Width } from '../Width'

export const Text: React.FC<
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
        id={name}
        type="text"
        defaultValue={defaultValue}
        {...register(name, { required })}
        className="
          w-full
          h-11 sm:h-12
          text-sm sm:text-base
          px-3 sm:px-4
          border border-gray-300
          rounded-md
          bg-white
          focus:outline-none
          focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
          transition-all
          placeholder:text-gray-400
        "
        placeholder={label}
      />

      {/* Error Message */}
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
