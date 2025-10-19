'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type InfoPanelClientProps = {
  dataSource?: string
  panelType?: string
  title?: string
  subheading?: string
  listType?: 'disc' | 'decimal'
  items?: Array<{ text: string } | string>
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

  // ✅ Auto-fetch package data from URL
  useEffect(() => {
    const fetchPackageData = async () => {
      if (dataSource !== 'auto') return
      
      // Extract package slug from URL
      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'packages') {
        console.warn('⚠️ Not on a package page, cannot auto-fetch')
        setLoading(false)
        return
      }
      
      const packageSlug = segments[1]
      if (!packageSlug) {
        console.warn('⚠️ No package slug in URL')
        setLoading(false)
        return
      }

      console.log(`🔍 Client auto-fetching info panel for: ${packageSlug} (type: ${panelType})`)

      try {
        const response = await fetch(`/api/packages?where[slug][equals]=${packageSlug}&depth=2&limit=1`)
        const data = await response.json()
        
        if (data.docs[0]) {
          const pkg = data.docs[0]
          
          // Transform based on panel type
          const panelData = await transformPackageToPanelData(pkg, panelType)

          console.log(`✅ Client loaded ${panelType} with ${panelData.items?.length || 0} items`)

          setTitle(panelData.title)
          setSubheading(panelData.subheading)
          setListType(panelData.listType)
          setItems(panelData.items)
        } else {
          console.warn('⚠️ Package not found')
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
          <div className="text-center text-gray-500">
            Loading information...
          </div>
        </div>
      </section>
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const ListComponent = listType === 'decimal' ? 'ol' : 'ul';
  const listStyleClass = listType === 'disc' ? 'list-disc' : 'list-decimal';

  return (
    <section className="relative overflow-hidden bg-white py-12 font-sans">
      {/* Background accent - matching DynamicScroller style */}
      
      <div className="relative px-8 md:px-16">
        {/* Header section - matching ClientStories style */}
        <header className="mb-12 space-y-4">
          {/* Title with serif italic font like ClientStories */}
          <h1 className="text-5xl md:text-6xl font-serif italic text-gray-900">
            {title}
          </h1>
          
          {/* Subheading with base text size */}
          {subheading && (
            <p className="text-base text-gray-600">
              {subheading}
            </p>
          )}
          
          {/* Divider line */}
          <div className="w-full border-t-4 border-dotted border-gray-300 pt-4" />
        </header>

        {/* Content section */}
        <div className="max-w-4xl">
          <ListComponent className={`${listStyleClass} list-outside pl-6 space-y-4 text-gray-700 text-base leading-relaxed`}>
            {items.map((item: any, index: number) => (
              <li key={index} className="leading-relaxed">
                {item?.text || item}
              </li>
            ))}
          </ListComponent>
        </div>
      </div>
    </section>
  );
};

// Helper function to transform package data (client-side)
async function transformPackageToPanelData(pkg: any, type: string) {
  switch (type) {
    case 'goodToKnow':
      return {
        title: 'Good to Know',
        subheading: `Important information about ${pkg.name}`,
        listType: 'disc' as const,
        items: (pkg.goodToKnow || []).map((item: any) => ({
          text: item.title ? `${item.title}: ${item.text}` : item.text
        })),
      }

    case 'inclusions':
      // For client-side, we need to fetch inclusions separately
      const inclusionIds = Array.isArray(pkg.inclusions) 
        ? pkg.inclusions.map((inc: any) => typeof inc === 'object' ? inc.id : inc).filter(Boolean)
        : []
      
      const inclusions = await Promise.all(
        inclusionIds.map(async (id: string) => {
          try {
            const response = await fetch(`/api/inclusions/${id}`)
            const inc = await response.json()
            return { 
              text: inc.description || inc.name
            }
          } catch (err) {
            console.error('Error fetching inclusion:', err)
            return null
          }
        })
      )
      
      return {
        title: 'Inclusions',
        subheading: `What's included in ${pkg.name}`,
        listType: 'disc' as const,
        items: inclusions.filter(Boolean),
      }

    case 'exclusions':
      // For client-side, we need to fetch exclusions separately
      const exclusionIds = Array.isArray(pkg.exclusions) 
        ? pkg.exclusions.map((exc: any) => typeof exc === 'object' ? exc.id : exc).filter(Boolean)
        : []
      
      const exclusions = await Promise.all(
        exclusionIds.map(async (id: string) => {
          try {
            const response = await fetch(`/api/exclusions/${id}`)
            const exc = await response.json()
            return { 
              text: exc.description || exc.name
            }
          } catch (err) {
            console.error('Error fetching exclusion:', err)
            return null
          }
        })
      )
      
      return {
        title: 'Exclusions',
        subheading: `What's not included in ${pkg.name}`,
        listType: 'disc' as const,
        items: exclusions.filter(Boolean),
      }

    default:
      return {
        title: 'Information',
        listType: 'disc' as const,
        items: [],
      }
  }
}

export default InfoPanelClient;
