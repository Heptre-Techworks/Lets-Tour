// src/PackageLayout/hooks/revalidatePackageLayout.ts
import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidatePackageLayout: GlobalAfterChangeHook = async ({ req: { payload } }) => {
  payload.logger.info('Revalidating shared Package Layout')
  revalidateTag('packages-layout')
}
