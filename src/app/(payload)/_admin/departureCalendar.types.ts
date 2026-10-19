/** Serialisable data passed from the Departure Calendar server view to the client form. */

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'
export type DepartureStatus = 'open' | 'waitlist' | 'closed' | 'cancelled' | 'departed'
export type PayMode = 'inherit' | 'enabled' | 'disabled'
export type EndsMode = 'on_date' | 'perpetual'

export type PackageOption = {
  id: string
  name: string
  /** Free text from the package, e.g. "5N/6D" */
  duration: string
  price: number | null
  discountedPrice: number | null
  currency: Currency
  summary: string
  tagline: string
  destinations: string[]
  highlights: string[]
  days: { day: number; title: string }[]
}

export type ScheduleOption = { id: string; title: string }

export type ScheduleDoc = {
  id: string
  title: string
  packageId: string
  /** yyyy-mm-dd */
  startDate: string
  endsMode: EndsMode
  /** yyyy-mm-dd or '' */
  untilDate: string
  horizonMonths: number
  /** '0'..'6' (Sun..Sat) */
  daysOfWeek: string[]
  intervalWeeks: number
  departureTime: string
  tripNights: number | null
  /** yyyy-mm-dd[] */
  blackoutDates: string[]
  capacity: number | null
  label: string
  priceOverride: number | null
  currency: Currency
  status: DepartureStatus
  acceptOnlinePaymentMode: PayMode
  lastGeneratedAt: string | null
  generatedCount: number
}
