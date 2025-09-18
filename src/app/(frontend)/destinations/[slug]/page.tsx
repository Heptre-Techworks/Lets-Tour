// app/destinations/[slug]/page.tsx
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

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const results = await payload.find({
    collection: 'destinations',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 1000,
    pagination: false,
  })
  return (results.docs ?? [])
    .filter((d: any) => Boolean(d?.slug))
    .map((d: any) => ({ slug: String(d.slug) }))
}

type Args = { params: Promise<{ slug?: string }> }

const getDestinationLayout = unstable_cache(
  async (opts: { draft: boolean }) => {
    const payload = await getPayload({ config: configPromise })
    const global = await payload.findGlobal({
      slug: 'destinationLayout',
      
      draft: opts.draft,
      overrideAccess: opts.draft ? true : false,
    })
    return global
  },
  ['destination-layout-global'],
  { tags: ['destinations-layout'] },
)

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return <PayloadRedirects url="/destinations" />

  const url = `/destinations/${slug}`

  const [destination, layoutGlobal] = await Promise.all([
    queryDestinationBySlug({ slug }),
    getDestinationLayout({ draft }),
  ])

  if (!destination) {
    return <PayloadRedirects url={url} />
  }

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <RenderHero hero={(layoutGlobal as any)?.hero} />
      <RenderBlocks blocks={(layoutGlobal as any)?.layout ?? []} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await paramsPromise
  if (!slug) return {}

  const [destination, layoutGlobal] = await Promise.all([
    queryDestinationBySlug({ slug }),
    getDestinationLayout({ draft }),
  ])
  return generateMeta({ doc: (destination as any) ?? (layoutGlobal as any) })
}

const queryDestinationBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'destinations',
    draft,
    overrideAccess: draft ? true : false,
    limit: 1,
    pagination: false,
    depth: 0,
    where: { slug: { equals: slug } },
  })
  return (result.docs?.[0] as RequiredDataFromCollectionSlug<'destinations'>) || null
})
