'use client'

import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'

import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>

      const submitForm = async () => {
        setError(undefined)
        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // Show loader after 1 second delay
        loadingTimerID = setTimeout(() => setIsLoading(true), 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })

          // Secondary submission to Google Sheets (Fire & Forget)
          try {
            // Safely map data for Sheets (flatten objects)
            const sheetPayload = dataToSend.reduce(
              (acc, item) => {
                let val = item.value
                if (typeof val === 'object' && val !== null) {
                   // If it's rich text or complex object, stringify it
                   val = JSON.stringify(val)
                }
                acc[item.field] = val
                return acc
              },
              {} as Record<string, unknown>,
            )

            fetch('https://sheets-writer-1037202171762.us-central1.run.app', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sheetPayload),
            }).catch((err) => console.warn('Google Sheets submission failed:', err))
          } catch (e) {
            console.warn('Error preparing sheet payload:', e)
          }

          const res = await req.json()
          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)
            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect?.url) {
            router.push(redirect.url)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <div
      className="
        container 
        mx-auto 
        px-4 sm:px-6 
        lg:max-w-[48rem]
        py-6 sm:py-10
      "
    >
      {/* Intro Section */}
      {enableIntro && introContent && !hasSubmitted && (
        <RichText
          className="mb-6 sm:mb-10 text-center text-gray-700"
          data={introContent}
          enableGutter={false}
        />
      )}

      {/* Form Container */}
      <div
        className="
          p-4 sm:p-6 
          border border-border 
          rounded-xl 
          shadow-sm 
          bg-white
        "
      >
        <FormProvider {...formMethods}>
          {/* Confirmation Message */}
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} className="text-center text-green-600" />
          )}

          {/* Loading State */}
          {isLoading && !hasSubmitted && (
            <p className="text-center text-gray-600 animate-pulse">Submitting, please wait...</p>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center text-red-500 font-medium my-3">
              {`${error.status || '500'}: ${error.message || ''}`}
            </div>
          )}

          {/* Actual Form */}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="space-y-5 sm:space-y-6">
                {formFromProps?.fields?.map((field, index) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                  if (Field) {
                    return (
                      <div key={index}>
                        <Field
                          form={formFromProps}
                          {...field}
                          {...formMethods}
                          control={control}
                          errors={errors}
                          register={register}
                        />
                      </div>
                    )
                  }
                  return null
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-center">
                <Button
                  form={formID}
                  type="submit"
                  variant="default"
                  className="
                    w-full sm:w-auto 
                    px-6 py-3 
                    text-base sm:text-lg 
                    font-medium
                    bg-yellow-500 hover:bg-yellow-600
                    text-white
                    rounded-lg 
                    transition-all
                    duration-200
                  "
                >
                  {isLoading ? 'Submitting...' : submitButtonLabel}
                </Button>
              </div>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
