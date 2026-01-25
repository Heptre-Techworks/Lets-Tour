'use client'

import React, { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_CRITICAL } from 'lexical'
import { $patchStyleText } from '@lexical/selection'
import { Select } from '@payloadcms/ui'
import { usePayloadAPI } from '@payloadcms/ui'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'

const ToolbarFontDropdown = () => {
  const [editor] = useLexicalComposerContext()
  const [fonts, setFonts] = useState<{ label: string; value: string }[]>([])
  const [selectedFont, setSelectedFont] = useState<string>('Inter')
  
  // Use fetch directly as usePayloadAPI might be internal/limited in access context
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch('/api/globals/theme-settings?depth=1')
        const data = await response.json()
        const customFonts = data.fonts?.map((f: any) => ({
          label: f.name,
          value: `${f.name}, sans-serif`, // Auto-generate CSS value
          link: f.link 
        })) || []

        // Inject Styles dynamically
        customFonts.forEach((f: any) => {
          if (f.link && typeof document !== 'undefined') {
             if (!document.querySelector(`link[href="${f.link}"]`)) {
               const link = document.createElement('link')
               link.href = f.link
               link.rel = 'stylesheet'
               document.head.appendChild(link)
             }
          }
        })

        setFonts([
          { label: 'Inter', value: 'Inter, sans-serif' },
           ...customFonts
        ])
      } catch (e) {
        console.error('Failed to load fonts', e)
      }
    }
    fetchFonts()
  }, [])

  const applyFont = (fontValue: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-family': fontValue })
      }
    })
    setSelectedFont(fontValue)
  }

  return (
    <div className="font-family-dropdown" style={{ width: 140 }}>
      {/* value must be string, Select handles internal option mapping */}
      <Select
         options={fonts}
         // Fix: Check if value matches (handling the auto-generated suffix)
         value={fonts.find(f => f.value === selectedFont)} 
         onChange={(option: any) => applyFont(option ? (Array.isArray(option) ? option[0].value : option.value) : 'Inter, sans-serif')}
      />
    </div>
  )
}

export const DynamicFontFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: [
      {
         key: 'font',
         type: 'dropdown',
         ChildComponent: ToolbarFontDropdown,
         items: [], // Required property
         order: 20,
      }
    ]
  },
})
