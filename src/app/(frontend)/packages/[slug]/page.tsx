// src/app/(frontend)/packages/[slug]/page.tsx
import type { Metadata } from 'next'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import configPromise from '@payload-config'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import type { Page, Package } from '@/payload-types'

// Build static params using document IDs, but keep the param name `slug`
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const results = await payload.find({
    collection: 'packages',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 1000,
    pagination: false,
  })
  return (results.docs ?? []).map((d: any) => ({ slug: String(d.id) }))
}

type Args = { params: Promise<{ slug?: string }> }
type BlocksArray = NonNullable<Page['layout']>

// Cache the global layout similar to destinations
const getPackageLayout = unstable_cache(
  async (opts: { draft: boolean }) => {
    const payload = await getPayload({ config: configPromise })
    const global = await payload.findGlobal({
      slug: 'packageLayout',
      draft: opts.draft,
      overrideAccess: opts.draft ? true : false,
      depth: 2,
    })
    return global as { layout?: BlocksArray }
  },
  ['packages-layout-global'],
  { tags: ['packages-layout'] },
)

// Page
export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return <PayloadRedirects url="/packages" />

  const url = `/packages/${slug}`

  const [pkg, layoutGlobal] = await Promise.all([
    queryPackageById({ id: slug }),
    getPackageLayout({ draft }),
  ])

  if (!pkg) {
    return <PayloadRedirects url={url} />
  }

  return (
    <article className="pt-16 pb-24">
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderBlocks blocks={(layoutGlobal as any)?.layout ?? []} />
    </article>
  )
}

// Metadata
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return {}

  const [pkg, layoutGlobal] = await Promise.all([
    queryPackageById({ id: slug }),
    getPackageLayout({ draft }),
  ])

  // Prefer the specific package if found, otherwise fall back to the layout global
  return generateMeta({ doc: (pkg as any) ?? (layoutGlobal as any) })
}

// Data helper: single package by id (slug param acts as id)
const queryPackageById = cache(async ({ id }: { id: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'packages',
    draft,
    overrideAccess: draft ? true : false,
    limit: 1,
    pagination: false,
    depth: 2,
    where: { id: { equals: id } },
  })

  // If you have a generated type name, you can replace Package with RequiredDataFromCollectionSlug<'packages'>
  return (result.docs?.[0] as RequiredDataFromCollectionSlug<'packages'>) || null
})
