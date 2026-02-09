'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import RichText from '@/components/RichText'

type InfoPanelClientProps = {
  dataSource?: string
  panelType?: string
  title?: string
  subheading?: any
  listType?: 'disc' | 'decimal'
  items?: Array<{ text: any } | any>
}

export const InfoPanelClient: React.FC<InfoPanelClientProps> = ({
  dataSource = 'manual',
  panelType = 'goodToKnow',
  title: initialTitle = 'Good to Know',
  subheading: initialSubheading,
  listType: initialListType = 'disc',
  items: initialItems = [],
}) => {
  const pathname = usePathname()
  const [title, setTitle] = useState(initialTitle)
  const [subheading, setSubheading] = useState(initialSubheading)
  const [listType, setListType] = useState(initialListType)
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState(dataSource === 'auto')

  // local font helpers
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .font-amiri { font-family: 'Amiri', serif; }
      .font-nats { font-family: 'NATS', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // ✅ Auto-fetch package data from URL
  useEffect(() => {
    const fetchPackageData = async () => {
      if (dataSource !== 'auto') return

      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'packages') {
        setLoading(false)
        return
      }
      const packageSlug = segments[1]
      if (!packageSlug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/packages?where[slug][equals]=${packageSlug}&depth=2&limit=1`,
        )
        const data = await response.json()

        if (data.docs[0]) {
          const pkg = data.docs[0]
          const panelData = await transformPackageToPanelData(pkg, panelType)
          setTitle(panelData.title)
          setSubheading(panelData.subheading)
          setListType(panelData.listType)
          setItems(panelData.items)
        }
      } catch (error) {
        console.error('❌ Error fetching package data on client:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackageData()
  }, [pathname, dataSource, panelType])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-white py-12">
        <div className="container mx-auto px-8 md:px-16">
          <div className="text-center text-gray-500">Loading information...</div>
        </div>
      </section>
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const ListComponent = listType === 'decimal' ? 'ol' : 'ul'
  const listStyleClass = listType === 'disc' ? 'list-disc' : 'list-decimal'

  return (
    <section className="relative overflow-hidden bg-white py-12 font-sans">
      <div className="relative px-8 md:px-16">
        <header className="mb-12 space-y-4">
          {/* Title: Amiri italic 64px, 88%, -0.011em */}
          <h1 className="font-amiri italic font-bold text-[64px] leading-[0.88] tracking-[-0.011em] text-gray-900">
            {title}
          </h1>

          {/* Subheading: NATS 26px, 88%, -0.011em */}
          {subheading && (
            <div className="font-nats text-[26px] leading-[0.88] tracking-[-0.011em] text-gray-900">
               {typeof subheading === 'string' ? (
                  subheading
               ) : (
                  <RichText data={subheading as any} enableGutter={false} enableProse={false} />
               )}
            </div>
          )}

          <div className="w-full border-t-4 border-dotted border-gray-300 pt-4" />
        </header>

        <div className="max-w-4xl">
          {/* List items: NATS 24px, 24px line-height, -0.011em */}
          <ListComponent className={`${listStyleClass} list-outside pl-6 space-y-4 text-gray-700`}>
            {items.map((item: any, index: number) => (
              <li key={index} className="font-nats text-[24px] leading-[24px] tracking-[-0.011em]">
                {typeof (item?.text || item) === 'string' ? (
                   item?.text || item
                ) : (
                   <RichText data={item?.text || item} enableGutter={false} enableProse={false} />
                )}
              </li>
            ))}
          </ListComponent>
        </div>
      </div>
    </section>
  )
}

// Helper function to transform package data (client-side)
async function transformPackageToPanelData(pkg: any, type: string) {
  switch (type) {
    case 'goodToKnow':
      return {
        title: 'Good to Know',
        subheading: `Important information about ${pkg.name}`,
        listType: 'disc' as const,
        items: (pkg.goodToKnow || []).map((item: any) => ({
          text: item.title ? `${item.title}: ${item.text}` : item.text,
        })),
      }

    case 'inclusions':
      const inclusions =
        pkg.inclusions?.map((inc: any) => {
          if (typeof inc === 'object' && (inc.description || inc.name)) {
            return { text: inc.description || inc.name }
          }
          return null
        }).filter(Boolean) || []

      return {
        title: 'Inclusions',
        subheading: `What's included in ${pkg.name}`,
        listType: 'disc' as const,
        items: inclusions,
      }

    case 'exclusions':
      const exclusions =
        pkg.exclusions?.map((exc: any) => {
           if (typeof exc === 'object' && (exc.description || exc.name)) {
            return { text: exc.description || exc.name }
          }
          return null
        }).filter(Boolean) || []

      return {
        title: 'Exclusions',
        subheading: `What's not included in ${pkg.name}`,
        listType: 'disc' as const,
        items: exclusions,
      }

    default:
      return {
        title: 'Information',
        listType: 'disc' as const,
        items: [],
      }
  }
}

export default InfoPanelClient
