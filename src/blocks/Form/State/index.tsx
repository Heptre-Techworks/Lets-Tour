import React from 'react'
import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Controller } from 'react-hook-form'

import { Error } from '../Error'
import { Width } from '../Width'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, required, width }) => {
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

      {/* Controlled Select */}
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = stateOptions.find((t) => t.value === value)
          return (
            <Select onValueChange={onChange} value={controlledValue?.value}>
              <SelectTrigger
                id={name}
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
                "
              >
                <SelectValue placeholder={label} />
              </SelectTrigger>

              <SelectContent className="max-h-64 overflow-y-auto text-sm sm:text-base">
                {stateOptions.map(({ label, value }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="py-2 px-3 sm:py-2.5 sm:px-4 text-gray-800 cursor-pointer hover:bg-yellow-50 transition"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }}
        rules={{ required }}
      />

      {/* Error Message */}
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
