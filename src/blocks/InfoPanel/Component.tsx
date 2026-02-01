import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { InfoPanelClient } from './Component.client'
import type { InfoPanelBlock } from '@/payload-types'

type InfoPanelProps = InfoPanelBlock

export const InfoPanel = async (props: InfoPanelProps) => {
  const { dataSource, package: pkgProp, panelType, ...manualData } = props as any

  console.log('📋 InfoPanel server props:', {
    dataSource,
    panelType,
    hasPackage: !!pkgProp,
    packageType: typeof pkgProp,
  })

  // Manual mode - return as-is
  if (dataSource === 'manual') {
    console.log('📝 Using manual mode')
    return <InfoPanelClient {...manualData} dataSource="manual" />
  }

  // Auto mode - pass to client for URL-based fetching
  if (dataSource === 'auto') {
    console.log('🔄 Auto mode - client will fetch from URL')
    return (
      <Suspense fallback={null}>
        <InfoPanelClient 
          dataSource="auto"
          panelType={panelType || 'goodToKnow'}
          title=""
          subheading=""
          listType={manualData.listType || 'disc'}
          items={[]}
        />
      </Suspense>
    )
  }

  // Package selection mode - fetch on server
  if (dataSource === 'package' && pkgProp) {
    const payload = await getPayload({ config: configPromise })
    
    try {
      let pkgData: any = null

      // Check if already populated
      if (typeof pkgProp === 'object' && pkgProp.id) {
        pkgData = pkgProp
        console.log('✅ Using populated package:', pkgData.name)
      } else {
        // Need to fetch
        const pkgId = typeof pkgProp === 'string' ? pkgProp : pkgProp
        pkgData = await payload.findByID({
          collection: 'packages',
          id: pkgId,
          depth: 2,
        })
        console.log('✅ Fetched package:', pkgData.name)
      }

      if (pkgData) {
        const type = panelType || 'goodToKnow'
        const panelData = await transformPackageToPanelData(pkgData, type, payload)

        console.log(`✅ Server loaded ${type} with ${panelData.items?.length || 0} items`)

        return (
          <InfoPanelClient
            {...panelData}
            dataSource="package"
            listType={manualData.listType || panelData.listType}
          />
        )
      }
    } catch (error) {
      console.error('❌ InfoPanel server error:', error)
    }
  }

  // Fallback - empty state
  console.warn('⚠️ No valid data source, rendering empty')
  return null
}

// Helper function to transform package data into panel data
async function transformPackageToPanelData(pkg: any, type: string, payload: any) {
  switch (type) {
    case 'goodToKnow':
      return {
        title: 'Good to Know',
        subheading: `Important information about ${pkg.name}`,
        listType: 'disc',
        items: (pkg.goodToKnow || []).map((item: any) => ({
          text: item.title ? `${item.title}: ${item.text}` : item.text
        })),
      }

    case 'inclusions':
      const inclusionIds = Array.isArray(pkg.inclusions) ? pkg.inclusions : []
      const inclusions = await Promise.all(
        inclusionIds.map(async (incId: any) => {
          const id = typeof incId === 'object' ? incId.id : incId
          if (!id) return null
          try {
            const inc = await payload.findByID({
              collection: 'inclusions',
              id,
              depth: 0,
            })
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
        listType: 'disc',
        items: inclusions.filter(Boolean),
      }

    case 'exclusions':
      const exclusionIds = Array.isArray(pkg.exclusions) ? pkg.exclusions : []
      const exclusions = await Promise.all(
        exclusionIds.map(async (excId: any) => {
          const id = typeof excId === 'object' ? excId.id : excId
          if (!id) return null
          try {
            const exc = await payload.findByID({
              collection: 'exclusions',
              id,
              depth: 0,
            })
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
        listType: 'disc',
        items: exclusions.filter(Boolean),
      }

    default:
      return {
        title: 'Information',
        listType: 'disc',
        items: [],
      }
  }
}

export default InfoPanel
