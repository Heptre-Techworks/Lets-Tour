import type { Access, CollectionConfig } from 'payload'
import type { Package } from '@/payload-types'

const staffOnly: Access = ({ req }) => req?.user?.role === 'agent' || req?.user?.role === 'admin'

const currencyOptions = [
  { label: '₹ INR', value: 'INR' },
  { label: '$ USD', value: 'USD' },
  { label: '€ EUR', value: 'EUR' },
  { label: '£ GBP', value: 'GBP' },
]

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Waitlist', value: 'waitlist' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Departed', value: 'departed' },
]

const dayOptions = [
  { label: 'Sun', value: '0' },
  { label: 'Mon', value: '1' },
  { label: 'Tue', value: '2' },
  { label: 'Wed', value: '3' },
  { label: 'Thu', value: '4' },
  { label: 'Fri', value: '5' },
  { label: 'Sat', value: '6' },
]

/**
 * DepartureSchedules — a weekly recurrence rule that GENERATES individual
 * `package-departures` records. Admin-only (never `read: anyone`), so customers
 * never see rules; they only ever see the concrete generated departures.
 *
 * The whole rule + inline Preview/Generate lives on one editable record screen.
 * Generation is additive and idempotent (see the /api/departures/generate route).
 */
export const DepartureSchedules: CollectionConfig = {
  slug: 'departure-schedules',

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'package', 'startDate', 'endsMode', 'generatedCount', 'lastGeneratedAt'],
    group: 'Travel Management',
    description: 'Weekly recurrence rules that generate fixed package departures.',
  },

  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },

  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true, description: 'Auto-generated from the package and end date.' },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
      index: true,
      filterOptions: { scheduleType: { equals: 'fixed' } },
      admin: { description: 'Only fixed-schedule packages can have a recurrence.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: { width: '50%', description: 'First eligible date (inclusive).' },
        },
        {
          name: 'endsMode',
          type: 'select',
          required: true,
          defaultValue: 'on_date',
          options: [
            { label: 'Until a date', value: 'on_date' },
            { label: 'Perpetual (rolling)', value: 'perpetual' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'untilDate',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Generate up to and including this date.',
            condition: (data) => data?.endsMode !== 'perpetual',
          },
          validate: (value: unknown, { data }: { data?: any }) => {
            if (data?.endsMode === 'perpetual') return true
            if (!value) return 'An end date is required unless the schedule is perpetual.'
            if (data?.startDate && new Date(value as string) < new Date(data.startDate)) {
              return 'End date must be on or after the start date.'
            }
            return true
          },
        },
        {
          name: 'horizonMonths',
          type: 'number',
          min: 1,
          max: 36,
          defaultValue: 12,
          admin: {
            width: '50%',
            description: 'How many months ahead to keep generated (rolling window).',
            condition: (data) => data?.endsMode === 'perpetual',
          },
        },
      ],
    },
    {
      name: 'daysOfWeek',
      type: 'select',
      hasMany: true,
      required: true,
      options: dayOptions,
      admin: {
        description: 'Which weekdays departures start on.',
        components: {
          Field: '@/components/Admin/DepartureSchedules/DaysOfWeekPicker#DaysOfWeekPicker',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'intervalWeeks',
          type: 'number',
          min: 1,
          defaultValue: 1,
          admin: { width: '33%', description: '1 = every week, 2 = every other week.' },
        },
        {
          name: 'departureTime',
          type: 'text',
          admin: { width: '33%', description: 'Optional time of day, e.g. "09:00" (24h).' },
        },
        {
          name: 'tripNights',
          type: 'number',
          min: 0,
          admin: { width: '34%', description: 'If set, return date = start + N nights.' },
        },
      ],
    },
    {
      name: 'blackoutDates',
      type: 'array',
      labels: { singular: 'Skip date', plural: 'Blackout / skip dates' },
      admin: { description: 'Dates within the window to skip (holidays, sold-out weeks).' },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          validate: (value: unknown, { data }: { data?: any }) => {
            if (!value) return 'Pick a date.'
            const d = new Date(value as string)
            if (data?.startDate && d < new Date(data.startDate)) return 'Date is before the schedule start.'
            if (data?.endsMode !== 'perpetual' && data?.untilDate && d > new Date(data.untilDate)) {
              return 'Date is after the schedule end.'
            }
            return true
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'departureDefaults',
      label: 'Defaults applied to generated departures',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'capacity', type: 'number', min: 0, admin: { width: '50%', description: 'Seats per departure.' } },
            { name: 'label', type: 'text', admin: { width: '50%', description: 'Batch label, e.g. "Weekly Batch".' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'priceOverride', type: 'number', min: 0, admin: { width: '50%', description: 'Overrides package price (optional).' } },
            { name: 'currency', type: 'select', options: currencyOptions, defaultValue: 'INR', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'status', type: 'select', options: statusOptions, defaultValue: 'open', required: true, admin: { width: '50%' } },
            {
              name: 'acceptOnlinePaymentMode',
              type: 'select',
              defaultValue: 'inherit',
              options: [
                { label: 'Inherit from package', value: 'inherit' },
                { label: 'Force enabled', value: 'enabled' },
                { label: 'Force disabled', value: 'disabled' },
              ],
              admin: { width: '50%', description: 'Online payment for generated departures.' },
            },
          ],
        },
      ],
    },
    {
      name: 'generate',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/Admin/DepartureSchedules/GenerateDeparturesPanel#GenerateDeparturesPanel',
        },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'lastGeneratedAt', type: 'date', admin: { readOnly: true, width: '50%' } },
        {
          name: 'generatedCount',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '50%', description: 'Departures created by this schedule so far.' },
        },
      ],
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const ref = data.package ?? originalDoc?.package
        const packageId = typeof ref === 'object' && ref !== null ? ref.id : ref
        let pkg: Package | null = null
        if (packageId) {
          try {
            pkg = await req.payload.findByID({ collection: 'packages', id: packageId, depth: 0 })
          } catch {
            pkg = null
          }
        }
        const endsMode = data.endsMode ?? originalDoc?.endsMode
        const until = data.untilDate ?? originalDoc?.untilDate
        const ends =
          endsMode === 'perpetual'
            ? 'perpetual'
            : until
              ? new Date(until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'TBD'
        data.title = `${pkg?.name || 'Schedule'} — recurring (${ends})`
        return data
      },
    ],
  },
}

export default DepartureSchedules
