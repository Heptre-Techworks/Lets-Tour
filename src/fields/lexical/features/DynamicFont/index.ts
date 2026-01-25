import { createServerFeature } from '@payloadcms/richtext-lexical'

export const DynamicFontFeature = createServerFeature({
  feature: () => ({
    ClientFeature: '@/fields/lexical/features/DynamicFont/client#DynamicFontFeatureClient',
  }),
  key: 'dynamicFont',
})
