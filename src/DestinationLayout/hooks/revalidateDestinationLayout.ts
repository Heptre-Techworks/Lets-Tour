// src/DestinationLayout/hooks/revalidateDestinationLayout.ts
import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateDestinationLayout: GlobalAfterChangeHook = async ({ req: { payload } }) => {
  payload.logger.info('Revalidating shared Destination Layout')
  revalidateTag('destinations-layout')
}
