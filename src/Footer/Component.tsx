import React from 'react'
import { FooterClient } from './Component.client'
import type { Footer as FooterType } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  // getCachedGlobal applies a cache tag 'global_footer' internally
  const footerData = (await getCachedGlobal('footer', 1)()) as FooterType
  return <FooterClient data={footerData} />
}
