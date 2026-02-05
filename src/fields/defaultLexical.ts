import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  HTMLConverterFeature,
  TextStateFeature,
  defaultColors,
  type LinkFields,
} from '@payloadcms/richtext-lexical'
import { DynamicFontFeature } from './lexical/features/DynamicFont'

export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    HTMLConverterFeature({}),
    TextStateFeature({
      state: {
        // Colors (Background and Text)
        color: {
           ...defaultColors.text,
        },
        background: {
           ...defaultColors.background,
        },
        // Font Sizes (Legacy Text State)
        'font-size': {
           'small': { label: 'Small', css: { 'font-size': '14px' } },
           'medium': { label: 'Medium', css: { 'font-size': '16px' } },
           'large': { label: 'Large', css: { 'font-size': '20px' } },
           'xlarge': { label: 'Extra Large', css: { 'font-size': '24px' } },
           'xxlarge': { label: 'Huge', css: { 'font-size': '32px' } },
        }
      },
    }),
    DynamicFontFeature(),
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})
