import type { CollectionAfterChangeHook } from 'payload'

const idOf = (v: unknown): string | null => {
  if (v == null) return null
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && 'id' in v) return String((v as { id: unknown }).id)
  return null
}

/**
 * Recompute a departure's `seatsBooked` from confirmed bookings whenever a booking
 * tied to it changes.
 *
 * Recomputing from the source of truth (rather than incrementing) is idempotent and
 * avoids oversell drift under concurrent confirmations. Runs on the linked departure
 * only, and never writes back to bookings, so there's no hook recursion.
 */
export const syncDepartureSeats: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const departureIds = new Set<string>()
  const cur = idOf(doc?.packageDeparture)
  const prev = idOf(previousDoc?.packageDeparture)
  if (cur) departureIds.add(cur)
  if (prev) departureIds.add(prev) // handle re-assignment away from a departure

  for (const departureId of departureIds) {
    try {
      const confirmed = await req.payload.find({
        collection: 'bookings',
        where: {
          and: [
            { packageDeparture: { equals: departureId } },
            { status: { equals: 'confirmed' } },
          ],
        },
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      })

      const seats = confirmed.docs.reduce((sum: number, b: any) => {
        const p = b.numberOfPeople || {}
        return sum + (p.adults || 0) + (p.children || 0) + (p.infants || 0)
      }, 0)

      await req.payload.update({
        collection: 'package-departures',
        id: departureId,
        overrideAccess: true,
        data: { seatsBooked: seats },
      })
    } catch (e) {
      req.payload.logger.error(`syncDepartureSeats failed for departure ${departureId}: ${e}`)
    }
  }

  return doc
}
