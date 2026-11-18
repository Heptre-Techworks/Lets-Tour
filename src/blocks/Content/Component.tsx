import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && (
                  // Default text colour is black — also when the visitor's browser is in dark mode,
                  // which would otherwise switch the text to light grey / white (prose-invert).
                  // A colour picked in the admin is an inline style on the text, so it overrides this.
                  <RichText
                    data={richText}
                    enableGutter={false}
                    className="text-black dark:text-black [--tw-prose-body:#000] [--tw-prose-headings:#000] [--tw-prose-lead:#000] [--tw-prose-bold:#000] [--tw-prose-links:#000] [--tw-prose-bullets:#000] [--tw-prose-counters:#000] [--tw-prose-quotes:#000] [--tw-prose-captions:#000] dark:[--tw-prose-body:#000] dark:[--tw-prose-headings:#000] dark:[--tw-prose-lead:#000] dark:[--tw-prose-bold:#000] dark:[--tw-prose-links:#000] dark:[--tw-prose-bullets:#000] dark:[--tw-prose-counters:#000] dark:[--tw-prose-quotes:#000] dark:[--tw-prose-captions:#000]"
                  />
                )}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
