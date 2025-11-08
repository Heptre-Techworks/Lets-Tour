import React from 'react'
import type { CountryField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Error } from '../Error'
import { Width } from '../Width'
import { countryOptions } from './options'

export const Country: React.FC<
  CountryField & {
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
            *<span className="sr-only">(required)</span>
          </span>
        )}
      </Label>

      {/* Controlled Select */}
      <Controller
        control={control}
        defaultValue=""
        name={name}
        render={({ field: { onChange, value } }) => {
          const controlledValue = countryOptions.find((t) => t.value === value)
          return (
            <Select onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
              <SelectTrigger
                id={name}
                className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              >
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent className="max-h-[250px] overflow-y-auto">
                {countryOptions.map(({ label, value }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="text-sm sm:text-base py-2 px-3 hover:bg-gray-100 cursor-pointer"
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
