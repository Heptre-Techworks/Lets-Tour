// src/blocks/InstagramCarousel/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { InstagramCarouselClient } from './Component.client'
import type { InstagramCarouselBlock } from '@/payload-types'

export const InstagramCarousel = async (props: InstagramCarouselBlock) => {
  const { dataSource, postLimit, posts: manualPosts, ...rest } = props as any

  let posts = manualPosts || []

  // Fetch from SocialPosts collection
  if (dataSource !== 'manual') {
    const payload = await getPayload({ config: configPromise })

    try {
      const query: any = {
        limit: postLimit || 8,
        depth: 1,
        where: {
          platform: { equals: 'instagram' },
          isPublished: { equals: true },
        },
      }

      if (dataSource === 'featured') {
        query.where.isFeatured = { equals: true }
        query.sort = 'displayOrder'
        console.log('📸 Fetching featured Instagram posts')
      } else if (dataSource === 'recent') {
        query.sort = '-createdAt'
        console.log('📸 Fetching recent Instagram posts')
      }

      const result = await payload.find({
        collection: 'social-posts',
        ...query,
      })

      console.log(`✅ Found ${result.docs.length} Instagram posts`)

      // Transform to block format
      posts = result.docs.map((post: any) => ({
        url: post.postUrl,
        captioned: post.showCaption || false,
      }))

    } catch (error) {
      console.error('❌ Error fetching Instagram posts:', error)
    }
  }

  return <InstagramCarouselClient {...rest} posts={posts} />
}

export default InstagramCarousel
