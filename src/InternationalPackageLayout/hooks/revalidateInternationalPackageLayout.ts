// src/DestinationLayout/hooks/revalidateDestinationLayout.ts
import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateInternationalLayout: GlobalAfterChangeHook = async ({
  req: { payload },
}) => {
  payload.logger.info('Revalidating shared International Layout')
  revalidateTag('international-layout')
}
