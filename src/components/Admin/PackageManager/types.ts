// Plain data-transfer shapes passed from the server view to the client components.
// Kept decoupled from generated payload-types so the components don't depend on
// `pnpm generate:types` having run.

export type DepartureRow = {
  id: string
  title: string
  packageId: string | null
  packageName: string
  startDate: string | null
  endDate: string | null
  status: string
  capacity: number | null
  seatsBooked: number
  price: number | null
  currency: string
  acceptOnlinePayment: boolean
}

export type PackageOption = {
  id: string
  name: string
}

export type PackageManagerData = {
  departures: DepartureRow[]
  packages: PackageOption[]
  paymentsEnabled: boolean
  todayKey: string // YYYY-MM-DD
  initialMonth: string // YYYY-MM
}

export const STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'Waitlist', value: 'waitlist' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Departed', value: 'departed' },
] as const
