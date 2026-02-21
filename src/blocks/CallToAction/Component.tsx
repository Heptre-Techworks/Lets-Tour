import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  const validLinks = (links || []).filter(({ link }) => link && (link.label || link.url || link.reference))

  if (validLinks.length === 0) {
    return null
  }

  return (
    <div className="container">
      <div className="bg-card rounded border-border border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-8">
          {validLinks.map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...(link as any)} />
          })}
        </div>
      </div>
    </div>
  )
}
