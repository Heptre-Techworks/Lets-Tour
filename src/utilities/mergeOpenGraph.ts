import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Let\'s Tour - Your Ultimate Travel Experience.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: 'Let\'s Tour',
  title: 'Let\'s Tour',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  const merged = {
    ...defaultOpenGraph,
    ...og,
  }

  // Only fall back to default images if caller didn’t provide images (undefined)
  if (og?.images === undefined) {
    merged.images = defaultOpenGraph.images
  }

  return merged
}
