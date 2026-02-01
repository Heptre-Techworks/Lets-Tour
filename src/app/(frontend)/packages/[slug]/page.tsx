// app/(frontend)/packages/[slug]/page.tsx
import type { Metadata } from 'next'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import configPromise from '@payload-config'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const results = await payload.find({
    collection: 'packages',
    draft: false,
    overrideAccess: true,
    depth: 0,
    limit: 1000,
    pagination: false,
  })
  return (results.docs ?? [])
    .filter((p: any) => Boolean(p?.slug))
    .map((p: any) => ({ slug: String(p.slug) }))
}

type Args = { params: Promise<{ slug?: string }> }

const getPackageLayout = unstable_cache(
  async (opts: { draft: boolean }) => {
    const payload = await getPayload({ config: configPromise })
    const global = await payload.findGlobal({
      slug: 'packageLayout',
      draft: opts.draft,
      overrideAccess: true, // Always true to allow access
    })
    return global
  },
  ['package-layout-global'],
  { tags: ['packages-layout'] },
)

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return <PayloadRedirects url="/packages" />

  const url = `/packages/${slug}`

  const [packageData, layoutGlobal] = await Promise.all([
    queryPackageBySlug({ slug }),
    getPackageLayout({ draft }),
  ])

  if (!packageData) {
    return <PayloadRedirects url={url} />
  }

  return (
    <article className="pt-0 pb-15">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero hero={(layoutGlobal as any)?.hero} packageData={packageData as any} />
      <RenderBlocks blocks={(layoutGlobal as any)?.layout ?? []} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return {}

  const [packageData, layoutGlobal] = await Promise.all([
    queryPackageBySlug({ slug }),
    getPackageLayout({ draft }),
  ])
  return generateMeta({ doc: (packageData as any) ?? (layoutGlobal as any) })
}

const queryPackageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  try {
    const result = await payload.find({
      collection: 'packages',
      draft,
      overrideAccess: true, // Always true to allow access
      limit: 1,
      pagination: false,
      depth: 0,
      where: { slug: { equals: slug } },
    })
    return (result.docs?.[0] as RequiredDataFromCollectionSlug<'packages'>) || null
  } catch (error) {
    console.error('Error fetching package by slug:', error)
    return null
  }
})
