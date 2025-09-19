'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Category } from '@/payload-types' // ensure this exists from payload generate:types [web:104]
import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo = 'posts', showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn('border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer', className)}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>

      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            <div>
              {categories?.map((category, index) => {
                // Relationship values may be ID strings at depth 0, or populated docs at depth > 0 [web:102][web:108]
                if (typeof category === 'object' && category !== null) {
                  const { name } = category as Category
                  const categoryTitle = name || 'Untitled category'
                  const isLast = index === categories.length - 1
                  return (
                    <Fragment key={typeof category === 'object' && 'id' in category ? (category as Category).id : index}>
                      {categoryTitle}
                      {!isLast && <Fragment>,&nbsp;</Fragment>}
                    </Fragment>
                  )
                }
                // If it's an ID (string), skip or render a placeholder; choose skip here [web:102][web:108]
                return null
              })}
            </div>
          </div>
        )}

        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}

        {description && (
          <div className="mt-2">
            <p>{sanitizedDescription}</p>
          </div>
        )}
      </div>
    </article>
  )
}
