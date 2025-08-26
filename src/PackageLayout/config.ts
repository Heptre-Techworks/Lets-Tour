// payload/globals/PackageLayout.ts
import type { GlobalConfig } from 'payload'

export const PackageLayout: GlobalConfig = {
  slug: 'packageLayout',
  label: 'Package Page Settings',
  fields: [
    {
      name: 'heroHeight',
      type: 'select',
      defaultValue: 'h-96',
      options: [
        { label: 'Small (300px)', value: 'h-80' },
        { label: 'Medium (384px)', value: 'h-96' },
        { label: 'Large (500px)', value: 'h-[500px]' },
      ],
    },
    {
      name: 'showDestination',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showDuration',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'packageDetailsTitle',
      type: 'text',
      defaultValue: 'Package Details',
    },
    {
      name: 'showItinerary',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'inclusionsTitle',
      type: 'text',
      defaultValue: 'Inclusions',
    },
    {
      name: 'exclusionsTitle',
      type: 'text',
      defaultValue: 'Exclusions',
    },
    {
      name: 'galleryTitle',
      type: 'text',
      defaultValue: 'Gallery',
    },
    {
      name: 'galleryColumns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'relatedPackagesTitle',
      type: 'text',
      defaultValue: 'More Packages',
    },
    {
      name: 'bookButtonText',
      type: 'text',
      defaultValue: 'Book Now',
    },
    {
      name: 'wishlistButtonText',
      type: 'text',
      defaultValue: 'Add to Wishlist ♡',
    },
  ],
}
