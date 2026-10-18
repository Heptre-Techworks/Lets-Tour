/**
 * Lets Tour — admin structure (single source of truth for the sidebar AND the dashboard).
 *
 * This file only DESCRIBES how existing collections / globals are grouped in the admin UI.
 * It never touches data: every slug below is an existing Payload collection or global, so all
 * records, relationships, API routes and hooks keep working exactly as before.
 *
 * To move an item to another group, or rename it, edit it here. Items whose slug does not exist
 * in payload.config.ts (e.g. `site-settings`, `internationallayout`) are skipped automatically
 * and will appear as soon as that collection/global is registered.
 */

export type ItemKind = 'collection' | 'global' | 'custom'

export type ItemDef = {
  label: string
  /** One muted line shown on the dashboard card. */
  desc: string
  kind: ItemKind
  /** Collection / global slug, or a unique key for custom items. */
  slug: string
  /** custom items only: path after the admin route, e.g. "/departure-calendar" */
  path?: string
  /** Show the "+" (create) button on the dashboard card. Collections only. */
  create?: boolean
}

export type GroupDef = {
  id: string
  label: string
  items: ItemDef[]
}

export const ADMIN_GROUPS: GroupDef[] = [
  {
    id: 'bookings-leads',
    label: 'Bookings & Leads',
    items: [
      { label: 'Bookings', desc: 'Book Now orders, payments & status', kind: 'collection', slug: 'bookings', create: true },
      { label: 'Custom Trip Requests', desc: 'Plan My Trip & Curate enquiries', kind: 'collection', slug: 'custom-trip-requests', create: true },
      { label: 'Bulk Booking Requests', desc: 'Group & corporate enquiries', kind: 'collection', slug: 'bulk-booking-requests', create: true },
      { label: 'Form Submissions', desc: 'Entries from website forms', kind: 'collection', slug: 'form-submissions' },
    ],
  },
  {
    id: 'trips-departures',
    label: 'Trips & Departures',
    items: [
      { label: 'Packages', desc: 'Itineraries, pricing & publishing', kind: 'collection', slug: 'packages', create: true },
      { label: 'International Packages', desc: 'Overseas trip packages', kind: 'collection', slug: 'international-package', create: true },
      { label: 'Package Departures', desc: 'Dated departures, seats & price', kind: 'collection', slug: 'package-departures', create: true },
      { label: 'Departure Schedules', desc: 'Recurring departure rules', kind: 'collection', slug: 'departure-schedules', create: true },
      { label: 'Departure Calendar', desc: 'Set up recurring departures in one form', kind: 'custom', slug: 'departure-calendar', path: '/departure-calendar' },
    ],
  },
  {
    id: 'destinations-places',
    label: 'Destinations & Places',
    items: [
      { label: 'Destinations', desc: 'Destination pages, hero & gallery', kind: 'collection', slug: 'destinations', create: true },
      { label: 'Places', desc: 'Attractions shown as Things to Do', kind: 'collection', slug: 'places', create: true },
      { label: 'Cities', desc: 'Cities inside destinations', kind: 'collection', slug: 'cities', create: true },
      { label: 'Regions', desc: 'States & regions', kind: 'collection', slug: 'regions', create: true },
      { label: 'Countries', desc: 'Countries & continents', kind: 'collection', slug: 'countries', create: true },
    ],
  },
  {
    id: 'categories-options',
    label: 'Categories & Trip Options',
    items: [
      { label: 'Categories', desc: 'Experience, trip type & labels', kind: 'collection', slug: 'categories', create: true },
      // Kept (not merged) so no data is lost: Header mega menu & Search Filters still reference it.
      { label: 'Package Categories', desc: 'Used by the menu & search filters', kind: 'collection', slug: 'package-categories', create: true },
      { label: 'Themes', desc: 'Honeymoon, Family, Adventure…', kind: 'collection', slug: 'themes', create: true },
      { label: 'Vibes', desc: 'Mood & season badges', kind: 'collection', slug: 'vibes', create: true },
      { label: 'Inclusions', desc: 'What a package includes', kind: 'collection', slug: 'inclusions', create: true },
      { label: 'Exclusions', desc: 'What a package excludes', kind: 'collection', slug: 'exclusions', create: true },
      { label: 'Activities', desc: 'Activities offered on trips', kind: 'collection', slug: 'activities', create: true },
      { label: 'Amenities', desc: 'Hotel & stay amenities', kind: 'collection', slug: 'amenities', create: true },
      { label: 'Accommodation Types', desc: 'Hotel, resort, homestay…', kind: 'collection', slug: 'accommodation-types', create: true },
    ],
  },
  {
    id: 'marketing-reviews',
    label: 'Marketing & Reviews',
    items: [
      { label: 'Promotions', desc: 'Discounts, offers & promo codes', kind: 'collection', slug: 'promotions', create: true },
      { label: 'Marketing Banners', desc: 'Homepage & listing banners', kind: 'collection', slug: 'marketing-banners', create: true },
      { label: 'Social Posts', desc: 'Instagram & Facebook embeds', kind: 'collection', slug: 'social-posts', create: true },
      { label: 'Reviews', desc: 'Approve & feature traveller reviews', kind: 'collection', slug: 'reviews', create: true },
    ],
  },
  {
    id: 'pages-content',
    label: 'Pages & Content',
    items: [
      { label: 'Pages', desc: 'Block-based website pages', kind: 'collection', slug: 'pages', create: true },
      { label: 'Blog Posts', desc: 'Travel articles & guides', kind: 'collection', slug: 'posts', create: true },
      { label: 'Media Library', desc: 'Images, videos & PDFs', kind: 'collection', slug: 'media', create: true },
      { label: 'Forms', desc: 'Build & edit website forms', kind: 'collection', slug: 'forms', create: true },
      { label: 'Redirects', desc: 'Old URL to new URL', kind: 'collection', slug: 'redirects', create: true },
    ],
  },
  {
    id: 'site-design',
    label: 'Site Design',
    items: [
      { label: 'Home Page', desc: 'Home hero & landing settings', kind: 'global', slug: 'landing-page' },
      { label: 'Header & Menu', desc: 'Logo, mega menu & Curate button', kind: 'global', slug: 'header' },
      { label: 'Footer', desc: 'Columns, social & legal links', kind: 'global', slug: 'footer' },
      { label: 'Package Page Layout', desc: 'Template for every package page', kind: 'global', slug: 'packageLayout' },
      { label: 'Destination Page Layout', desc: 'Template for every destination page', kind: 'global', slug: 'destinationLayout' },
      { label: 'International Package Layout', desc: 'Template for overseas packages', kind: 'global', slug: 'internationallayout' },
      { label: 'Search Filters', desc: 'Price, duration & category filters', kind: 'global', slug: 'search-filters' },
      { label: 'Theme & Fonts', desc: 'Brand fonts & theme', kind: 'global', slug: 'theme-settings' },
    ],
  },
  {
    id: 'settings-access',
    label: 'Settings & Access',
    items: [
      { label: 'Site Settings', desc: 'Contact, WhatsApp, emails & social links', kind: 'global', slug: 'site-settings' },
      { label: 'Payment Settings', desc: 'Razorpay mode, currency & link expiry', kind: 'global', slug: 'payment-settings' },
      { label: 'Users & Roles', desc: 'Admins, agents & customers', kind: 'collection', slug: 'users', create: true },
      { label: 'Search Index', desc: 'Auto-built search entries (read-only)', kind: 'collection', slug: 'search' },
    ],
  },
]

/** Collections that exist in Payload but are intentionally not shown in the admin UI. */
export const HIDDEN_SLUGS = new Set<string>(['favorites'])

/** Dashboard badges: collection slug → Payload `where` that counts "new" items. */
export const LEAD_BADGES: Record<string, { label: string; where: Record<string, unknown> }> = {
  bookings: { label: 'new', where: { status: { equals: 'pending' } } },
  'custom-trip-requests': { label: 'new', where: { status: { equals: 'new' } } },
  'bulk-booking-requests': { label: 'new', where: { status: { equals: 'new' } } },
}
