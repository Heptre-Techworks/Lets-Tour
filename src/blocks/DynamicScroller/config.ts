// src/blocks/DynamicScroller/config.ts
import type { Block, Field } from 'payload'

const PackageItemBlock: Block = {
  slug: 'packageItem',
  interfaceName: 'DynamicScroller_PackageItem',
  labels: { singular: 'Package Item', plural: 'Package Items' },
  fields: [
    { name: 'id', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'price', type: 'text', required: true }, // keep string to allow commas
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    { name: 'tag', type: 'text' },
    { name: 'tagColor', type: 'text' },
  ],
}

const ItineraryDayBlock: Block = {
  slug: 'itineraryDay',
  interfaceName: 'DynamicScroller_ItineraryDay',
  labels: { singular: 'Itinerary Day', plural: 'Itinerary Days' },
  fields: [
    { name: 'day', type: 'text', required: true },
    {
      name: 'activities',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'detailsImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
      ],
    },
  ],
}

export const DynamicScroller: Block = {
  slug: 'dynamicScroller',
  interfaceName: 'DynamicScrollerBlock',
  labels: { singular: 'Dynamic Scroller', plural: 'Dynamic Scrollers' },
  fields: [
    {
      name: 'sections',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'id', type: 'text' },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'package',
          options: [
            { label: 'Package', value: 'package' },
            { label: 'Itinerary', value: 'itinerary' },
          ],
        },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        {
          name: 'theme',
          type: 'group',
          fields: [
            { name: 'background', type: 'text', defaultValue: 'bg-white' },
            { name: 'headerAccent', type: 'text' },
            { name: 'titleColor', type: 'text' },
            { name: 'subtitleColor', type: 'text' },
          ],
        },
        {
          name: 'navigation',
          type: 'group',
          fields: [
            {
              name: 'position',
              type: 'select',
              defaultValue: 'bottom-left',
              options: [
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Center', value: 'bottom-center' },
                { label: 'Bottom Right', value: 'bottom-right' },
              ],
            },
          ],
        },
        {
          name: 'items',
          type: 'blocks',
          blocks: [PackageItemBlock, ItineraryDayBlock],
          validate: (value, { siblingData }) => {
            type SectionType = 'package' | 'itinerary'
            const sectionType = (
              siblingData as { type?: SectionType } | undefined
            )?.type

            const rows = Array.isArray(value) ? value : []
            const invalid = rows.some((row: any) => {
              if (sectionType === 'package') return row?.blockType !== 'packageItem'
              if (sectionType === 'itinerary') return row?.blockType !== 'itineraryDay'
              return false
            })

            return invalid ? 'Items do not match section type.' : true
          },
        } as Field,
      ],
    },
  ],
}
