import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

/** Extract an id from a Payload relationship value (id string or populated doc). */
export const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && 'id' in v) return String((v as { id: unknown }).id)
  return null
}

let cached: Promise<Payload> | null = null
export const getPayloadClient = (): Promise<Payload> => {
  if (!cached) cached = getPayload({ config })
  return cached
}

/**
 * Resolve whether a booking may be paid online, layering the per-booking override
 * on top of the departure and package toggles. All inputs are the already-loaded
 * (populated) records tied to real DB documents.
 */
export const resolveProductAccept = (args: {
  override?: string | null // 'inherit' | 'enabled' | 'disabled'
  departureAccept?: boolean | null
  packageDefault?: boolean | null
}): boolean => {
  if (args.override === 'enabled') return true
  if (args.override === 'disabled') return false
  return args.departureAccept ?? args.packageDefault ?? true
}
