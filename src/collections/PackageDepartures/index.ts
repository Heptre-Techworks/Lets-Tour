import type { CollectionConfig } from 'payload'
import type { Package } from '@/payload-types'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

// Currency options mirror the Packages / Bookings collections.
const currencyOptions = [
  { label: '₹ INR', value: 'INR' },
  { label: '$ USD', value: 'USD' },
  { label: '€ EUR', value: 'EUR' },
  { label: '£ GBP', value: 'GBP' },
]

/**
 * PackageDepartures — one record per fixed departure of a Package.
 *
 * A dedicated collection (rather than an array on Packages) so departures can be:
 *  - queried across all packages for the admin calendar (single payload.find)
 *  - related to by Bookings (relationship → package-departures)
 *  - given atomic seat counters, their own list/filter/edit URLs, and access control.
 *
 * The parent Package's `scheduleType` field decides whether departures are relevant
 * (`fixed`) or the package is sold `on_request`.
 */
export const PackageDepartures: CollectionConfig = {
  slug: 'package-departures',

  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'package',
      'startDate',
      'status',
      'capacity',
      'seatsBooked',
      'acceptOnlinePayment',
    ],
    group: 'Travel Management',
  },

  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated from the package name and start date.',
      },
    },
    {
      name: 'package',
      type: 'relationship',
      relationTo: 'packages',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          index: true,
          admin: {
            width: '50%',
            description: 'Departure date (shown on the calendar).',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Return date (optional).',
          },
        },
      ],
    },
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Optional batch label, e.g. "Diwali Batch".',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'capacity',
          type: 'number',
          min: 0,
          admin: {
            width: '50%',
            description: 'Total seats available for this departure.',
          },
        },
        {
          name: 'seatsBooked',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            width: '50%',
            readOnly: true,
            description: 'Seats confirmed so far (maintained automatically).',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceOverride',
          type: 'number',
          min: 0,
          admin: {
            width: '50%',
            description: 'Overrides the package price for this departure (optional).',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: currencyOptions,
          defaultValue: 'INR',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Waitlist', value: 'waitlist' },
            { label: 'Closed', value: 'closed' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Departed', value: 'departed' },
          ],
          defaultValue: 'open',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'acceptOnlinePayment',
          type: 'checkbox',
          label: 'Accept Online Payment',
          admin: {
            width: '50%',
            description:
              'Allow customers to pay online for this departure. Defaults from the package.',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not shown to customers).',
      },
    },
  ],

  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // Merge with the existing doc so partial updates (e.g. a PATCH that only
        // toggles `acceptOnlinePayment`) don't blank out the title.
        const packageRef = data.package ?? originalDoc?.package
        const packageId =
          typeof packageRef === 'object' && packageRef !== null ? packageRef.id : packageRef
        const startDate = data.startDate ?? originalDoc?.startDate

        let pkg: Package | null = null
        if (packageId) {
          try {
            pkg = await req.payload.findByID({
              collection: 'packages',
              id: packageId,
              depth: 0,
            })
          } catch {
            pkg = null
          }
        }

        // Auto-generate a human-readable title, e.g. "Spanish Escape — 12 Aug 2026".
        const pkgName = pkg?.name || 'Departure'
        const dateLabel = startDate
          ? new Date(startDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'TBD'
        data.title = `${pkgName} — ${dateLabel}`

        // Inherit the payment toggle from the package default only on first set.
        if (data.acceptOnlinePayment === undefined || data.acceptOnlinePayment === null) {
          data.acceptOnlinePayment =
            originalDoc?.acceptOnlinePayment ?? pkg?.defaultAcceptOnlinePayment ?? true
        }

        return data
      },
    ],
  },
}

export default PackageDepartures
