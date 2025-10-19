// src/blocks/DynamicScroller/config.ts
import type { Block } from 'payload'

// ==================== PACKAGE SECTION ====================
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
        { label: 'Featured Destinations', value: 'featuredDestinations' },
        { label: 'Select Destinations', value: 'destinations' },
        { label: 'Select Vibes', value: 'vibes' },
      ],
    },
    {
      name: 'destinations',
      type: 'relationship',
      relationTo: 'destinations',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.populatePackagesBy === 'destinations',
        description: 'Select multiple destinations',
      },
    },
    {
      name: 'vibes',
      type: 'relationship',
      relationTo: 'vibes',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.populatePackagesBy === 'vibes',
        description: 'Select multiple vibes',
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

// ==================== DESTINATION SECTION ====================
const DestinationSectionBlock: Block = {
  slug: 'destinationSection',
  interfaceName: 'DynamicScroller_DestinationSection',
  labels: { singular: 'Destination Section', plural: 'Destination Sections' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Featured Destinations' },
    { name: 'subtitle', type: 'text' },
    {
      name: 'populateDestinationsBy',
      type: 'select',
      defaultValue: 'featured',
      required: true,
      options: [
        { label: 'Featured Destinations', value: 'featured' },
        { label: 'Popular Destinations', value: 'popular' },
        { label: 'In Season', value: 'inSeason' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'destinationLimit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 20,
      admin: {
        condition: (_, siblingData) => siblingData.populateDestinationsBy !== 'manual',
      },
    },
    {
      name: 'manualItems',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.populateDestinationsBy === 'manual',
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

// ==================== VIBE SECTION ====================
const VibeSectionBlock: Block = {
  slug: 'vibeSection',
  interfaceName: 'DynamicScroller_VibeSection',
  labels: { singular: 'Vibe Match Section', plural: 'Vibe Match Sections' },
  fields: [
    { 
      name: 'title', 
      type: 'text', 
      defaultValue: 'Vibe Match',
      admin: { description: 'Section heading' }
    },
    { 
      name: 'subtitle', 
      type: 'text',
      defaultValue: "Today's enemy is tomorrow's friend.*",
      admin: { description: 'Optional subtitle' }
    },
    {
      name: 'vibes',
      type: 'relationship',
      relationTo: 'vibes',
      hasMany: true,
      required: true,
      admin: {
        description: 'Select vibes to display (e.g., Outdoor, Relaxing, Glamping, Girls Day Out)',
      },
    },
    {
      name: 'packagesPerVibe',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 10,
      admin: {
        description: 'How many packages to show per vibe',
      },
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'background', type: 'text', defaultValue: 'bg-[#FFD89B]' },
      ],
    },
    { name: 'showNavigation', type: 'checkbox', defaultValue: true },
  ],
}

// ==================== ITINERARY SECTION ====================
const ItinerarySectionBlock: Block = {
  slug: 'itinerarySection',
  interfaceName: 'DynamicScroller_ItinerarySection',
  labels: { singular: 'Itinerary Section', plural: 'Itinerary Sections' },
  fields: [
    { 
      name: 'title', 
      type: 'text',
      admin: { description: 'Section heading (e.g., "Day by Day Itinerary")' }
    },
    { 
      name: 'subtitle', 
      type: 'text',
      admin: { description: 'Optional subtitle' }
    },
    {
      name: 'itinerarySource',
      type: 'select',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: 'Auto (from URL)', value: 'package' },
        { label: 'Manual Days', value: 'manual' },
      ],
      admin: {
        description: 'Auto mode detects package from URL. Use manual for custom itineraries.',
      },
    },
    // ✅ ADDED: Package relation field for specific package selection
    {
      name: 'packageRelation',
      type: 'relationship',
      relationTo: 'packages',
      admin: {
        condition: (_, siblingData) => siblingData.itinerarySource === 'package',
        description: 'Optional: Select a specific package. Leave empty to auto-detect from URL.',
      },
    },
    {
      name: 'manualDays',
      type: 'array',
      minRows: 1,
      admin: {
        condition: (_, siblingData) => siblingData.itinerarySource === 'manual',
        description: 'Create custom itinerary days',
      },
      fields: [
        { 
          name: 'day', 
          type: 'text', 
          required: true,
          admin: {
            placeholder: 'Day 1: Arrival in Bali',
          }
        },
        {
          name: 'activities',
          type: 'array',
          minRows: 1,
          fields: [
            { 
              name: 'icon', 
              type: 'upload', 
              relationTo: 'media',
              admin: {
                description: 'Activity icon (optional)',
              }
            },
            { 
              name: 'description', 
              type: 'textarea', 
              required: true,
              admin: {
                placeholder: 'Describe the activity...',
              }
            },
            { 
              name: 'detailsImage', 
              type: 'upload', 
              relationTo: 'media',
              admin: {
                description: 'Additional image for this activity (optional)',
              }
            },
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
    { 
      name: 'showNavigation', 
      type: 'checkbox', 
      defaultValue: true,
      label: 'Show Navigation Arrows',
    },
  ],
}

// ==================== MAIN BLOCK ====================
export const DynamicScroller: Block = {
  slug: 'dynamicScroller',
  interfaceName: 'DynamicScrollerBlock',
  labels: { singular: 'Dynamic Scroller', plural: 'Dynamic Scrollers' },
  fields: [
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        PackageSectionBlock,
        DestinationSectionBlock,
        VibeSectionBlock,
        ItinerarySectionBlock,
      ],
      required: true,
      minRows: 1,
      admin: {
        description: 'Add different types of scrollable sections to your page',
      },
    },
  ],
}

export default DynamicScroller
