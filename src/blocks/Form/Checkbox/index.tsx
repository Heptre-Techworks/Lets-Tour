import React from 'react'
import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const props = register(name, { required })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 py-1">
        <CheckboxUi
          id={name}
          defaultChecked={defaultValue}
          {...props}
          onCheckedChange={(checked) => setValue(props.name, checked)}
          className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 transition-all"
        />
        <Label
          htmlFor={name}
          className="text-sm sm:text-base md:text-[17px] leading-snug text-gray-800 cursor-pointer select-none"
        >
          {required && (
            <span className="text-red-500 mr-1">
              *<span className="sr-only">(required)</span>
            </span>
          )}
          {label}
        </Label>
      </div>

      {errors[name] && <Error name={name} />}
    </Width>
  )
}
