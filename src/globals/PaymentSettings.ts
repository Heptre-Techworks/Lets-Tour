import type { GlobalConfig } from 'payload'

/**
 * Admin-facing payment configuration.
 *
 * Secrets (Razorpay key secret, webhook secret) intentionally live ONLY in env,
 * never in the DB. This global holds the non-secret, operational settings the
 * team manages day to day, plus a read-only status panel that reports whether
 * the env keys are configured.
 *
 * Effective "can we charge?" gate:
 *   process.env.PAYMENTS_ENABLED === 'true'   (hard deploy switch)
 *   && keys present in env
 *   && this.enableOnlinePayments              (operational toggle)
 *   && per-package / per-departure / per-booking product toggle
 */
export const PaymentSettings: GlobalConfig = {
  slug: 'payment-settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: ({ req }) => Boolean(req?.user),
    update: ({ req }) => req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'status',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/Admin/Payments/PaymentStatusPanel#PaymentStatusPanel',
        },
      },
    },
    {
      name: 'enableOnlinePayments',
      type: 'checkbox',
      label: 'Enable Online Payments',
      defaultValue: false,
      admin: {
        description:
          'Day-to-day master switch. Also requires PAYMENTS_ENABLED=true and Razorpay keys in env.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [{ label: 'Razorpay', value: 'razorpay' }],
          defaultValue: 'razorpay',
          admin: { width: '50%' },
        },
        {
          name: 'mode',
          type: 'select',
          options: [
            { label: 'Test', value: 'test' },
            { label: 'Live', value: 'live' },
          ],
          defaultValue: 'test',
          admin: {
            width: '50%',
            description: 'Informational — the active keys are set per deployment via env.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'defaultCurrency',
          type: 'select',
          options: [
            { label: '₹ INR', value: 'INR' },
            { label: '$ USD', value: 'USD' },
            { label: '€ EUR', value: 'EUR' },
            { label: '£ GBP', value: 'GBP' },
          ],
          defaultValue: 'INR',
          admin: { width: '50%' },
        },
        {
          name: 'paymentLinkExpiryHours',
          type: 'number',
          min: 1,
          defaultValue: 48,
          admin: {
            width: '50%',
            description: 'Hours before a generated payment link expires.',
          },
        },
      ],
    },
    {
      name: 'businessName',
      type: 'text',
      admin: {
        description: 'Shown to customers on payment links / checkout (e.g. "Lets Tour").',
      },
    },
  ],
}

export default PaymentSettings
