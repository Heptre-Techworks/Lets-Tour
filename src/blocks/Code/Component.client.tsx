'use client'

import { Highlight, themes } from 'prism-react-renderer'
import React from 'react'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  if (!code) return null

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-lg border border-border bg-black">
      <Highlight code={code} language={language} theme={themes.vsDark}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre
            className="
              relative 
              p-3 sm:p-4 
              text-[11px] sm:text-xs md:text-sm 
              leading-relaxed 
              overflow-x-auto 
              whitespace-pre-wrap 
              break-words 
              font-mono 
              text-gray-100 
              scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
            "
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ className: 'table-row', line })}>
                <span className="table-cell select-none text-right pr-3 text-gray-500">
                  {i + 1}
                </span>
                <span className="table-cell pl-2">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}

            {/* Copy button — positioned top-right for all screen sizes */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <CopyButton code={code} />
            </div>
          </pre>
        )}
      </Highlight>
    </div>
  )
}
