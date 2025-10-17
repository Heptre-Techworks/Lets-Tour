// src/blocks/DynamicScroller/config.ts
import type { Block } from 'payload'

// Define section blocks
const PackageSectionBlock: Block = {
  slug: 'packageSection',
  interfaceName: 'DynamicScroller_PackageSection',
  labels: { singular: 'Package Section', plural: 'Package Sections' },
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Use {slug} for auto-replacement' } },
    { name: 'subtitle', type: 'text' },
    {
      name: 'populatePackagesBy',
      type: 'select',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Auto (from URL)', value: 'auto' },
        { label: 'Featured Packages', value: 'featured' },
        { label: 'Select Destination', value: 'destination' },
      ],
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: {
        condition: (_, siblingData) => siblingData.populatePackagesBy === 'destination',
      },
    },
    {
      name: 'packageLimit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData.populatePackagesBy !== 'manual',
      },
    },
    {
      name: 'manualItems',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.populatePackagesBy === 'manual',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'price', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'tag', type: 'text' },
        { name: 'tagColor', type: 'text' },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'background', type: 'text', defaultValue: 'bg-white' },
      ],
    },
    { name: 'showNavigation', type: 'checkbox', defaultValue: true },
  ],
}

const ItinerarySectionBlock: Block = {
  slug: 'itinerarySection',
  interfaceName: 'DynamicScroller_ItinerarySection',
  labels: { singular: 'Itinerary Section', plural: 'Itinerary Sections' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },
    {
      name: 'itinerarySource',
      type: 'select',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'From Current Package (URL)', value: 'package' },
      ],
    },
    {
      name: 'manualDays',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.itinerarySource === 'manual',
      },
      fields: [
        { name: 'day', type: 'text', required: true },
        {
          name: 'activities',
          type: 'array',
          fields: [
            { name: 'icon', type: 'upload', relationTo: 'media' },
            { name: 'description', type: 'textarea', required: true },
            { name: 'detailsImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'background', type: 'text', defaultValue: 'bg-white' },
      ],
    },
    { name: 'showNavigation', type: 'checkbox', defaultValue: true },
  ],
}

export const DynamicScroller: Block = {
  slug: 'dynamicScroller',
  interfaceName: 'DynamicScrollerBlock',
  labels: { singular: 'Dynamic Scroller', plural: 'Dynamic Scrollers' },
  fields: [
    {
      name: 'sections',
      type: 'blocks',
      blocks: [PackageSectionBlock, ItinerarySectionBlock],
      required: true,
      minRows: 1,
    },
  ],
}

export default DynamicScroller
