// src/app/(frontend)/packages/[slug]/page.tsx
import type { Metadata } from 'next'
import React, { cache } from 'react'
import { draftMode } from 'next/headers'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import type { Page } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'packages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return (result.docs ?? [])
    .filter((doc) => typeof doc.slug === 'string' && doc.slug.length > 0)
    .map(({ slug }) => ({ slug }))
}
type BlocksRow = Page['layout']
type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function PackagePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = `/packages/${slug}`

  const pkg = await queryPackageBySlug({ slug })
  if (!pkg) {
    return <PayloadRedirects url={url} />
  }

  const layoutGlobal = await getPackageLayout()
  const blocks: BlocksArray = Array.isArray(layoutGlobal?.layout) ? layoutGlobal.layout : []

  return (
    <article className="pt-16 pb-24">
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderBlocks blocks={blocks} />
    </article>
  )
}

// generateMetadata (or the call site)
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const pkg = await queryPackageBySlug({ slug }) // returns a single Package | null
  return generateMeta({ doc: pkg })
}


// Data helpers (cached)
const queryPackageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'packages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
    depth: 2,
  })
  const doc = Array.isArray(result.docs) && result.docs.length > 0 ? result.docs : null

  return doc
})

type BlocksArray = NonNullable<Page['layout']>
type PackageLayoutGlobal = { layout?: BlocksArray }

// Fetch the singleton global that stores the blocks layout for package pages
const getPackageLayout = cache(async (): Promise<PackageLayoutGlobal> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const global = await payload.findGlobal({
    slug: 'packageLayout', // ensure this matches your Global slug
    draft,
    depth: 2,
  })
  return global as PackageLayoutGlobal
})

// Optional: If live preview is used on this route
import { LivePreviewListener } from '@/components/LivePreviewListener'
