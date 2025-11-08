import clsx from 'clsx'
import React from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@/payload-types'
import { Card } from '../../components/Card'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({ className, docs, introContent }) => {
  return (
    <div className={clsx('w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {/* ✅ Intro text (RichText block) */}
      {introContent && (
        <div className="mb-6 sm:mb-8">
          <RichText data={introContent} enableGutter={false} />
        </div>
      )}

      {/* ✅ Responsive grid layout */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-4 
          sm:gap-6 
          lg:gap-8 
          items-stretch
        "
      >
        {docs?.map((doc, index) => {
          if (typeof doc === 'string') return null
          return (
            <div
              key={index}
              className="
                transition-transform duration-300 
                hover:scale-[1.02] 
                hover:shadow-md 
                rounded-xl
              "
            >
              <Card doc={doc} relationTo="posts" showCategories />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RelatedPosts
