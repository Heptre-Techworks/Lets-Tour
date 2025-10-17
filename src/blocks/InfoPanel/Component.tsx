// src/blocks/InfoPanel/Component.tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { InfoPanelClient } from './Component.client'
import type { InfoPanelBlock } from '@/payload-types'

type InfoPanelProps = InfoPanelBlock & {
  slug?: string  // Package slug from page context
}

export const InfoPanel = async (props: InfoPanelProps) => {
  const { dataSource, package: pkgProp, panelType, slug, ...manualData } = props as any

  // Manual mode - return as-is
  if (dataSource === 'manual') {
    return <InfoPanelClient {...manualData} />
  }

  const payload = await getPayload({ config: configPromise })
  let panelData: any = {}

  try {
    let pkgId: string | undefined

    // Get package ID
    if (dataSource === 'auto' && slug) {
      console.log('🎯 Auto-detecting package from slug:', slug)
      
      const pkg = await payload.find({
        collection: 'packages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      })
      
      if (pkg.docs[0]) {
        pkgId = pkg.docs[0].id
        console.log('✅ Found package:', pkg.docs[0].name)
      }
    } else if (dataSource === 'package' && pkgProp) {
      pkgId = typeof pkgProp === 'object' ? pkgProp.id : pkgProp
      console.log('📦 Using selected package:', pkgId)
    }

    // Fetch package data
    if (pkgId) {
      const pkg = await payload.findByID({
        collection: 'packages',
        id: pkgId,
        depth: 2,
      })

      const type = panelType || 'goodToKnow'

      // Map panel type to package data
      switch (type) {
        case 'goodToKnow':
          // goodToKnow has { title?, text } structure
          panelData = {
            title: 'Good to Know',
            subheading: `Important information about ${pkg.name}`,
            listType: 'disc',
            items: (pkg.goodToKnow || []).map((item: any) => ({
              text: item.title ? `${item.title}: ${item.text}` : item.text
            })),
          }
          break

        case 'inclusions':
          // Fetch related inclusions
          const inclusionIds = Array.isArray(pkg.inclusions) ? pkg.inclusions : []
          const inclusions = await Promise.all(
            inclusionIds.map(async (incId: any) => {
              const id = typeof incId === 'object' ? incId.id : incId
              try {
                const inc = await payload.findByID({
                  collection: 'inclusions',
                  id,
                  depth: 0,
                })
                // ✅ Inclusions has: code, name, category, description, icon
                return { 
                  text: inc.description || inc.name  // Use description first, fallback to name
                }
              } catch (err) {
                console.error('Error fetching inclusion:', err)
                return null
              }
            })
          )
          
          panelData = {
            title: 'Inclusions',
            subheading: 'What\'s included in this package',
            listType: 'disc',
            items: inclusions.filter(Boolean),
          }
          break

        case 'exclusions':
          // Fetch related exclusions (same structure as inclusions)
          const exclusionIds = Array.isArray(pkg.exclusions) ? pkg.exclusions : []
          const exclusions = await Promise.all(
            exclusionIds.map(async (excId: any) => {
              const id = typeof excId === 'object' ? excId.id : excId
              try {
                const exc = await payload.findByID({
                  collection: 'exclusions',
                  id,
                  depth: 0,
                })
                // ✅ Exclusions has: code, name, category, description, icon
                return { 
                  text: exc.description || exc.name  // Use description first, fallback to name
                }
              } catch (err) {
                console.error('Error fetching exclusion:', err)
                return null
              }
            })
          )
          
          panelData = {
            title: 'Exclusions',
            subheading: 'What\'s not included in this package',
            listType: 'disc',
            items: exclusions.filter(Boolean),
          }
          break

        default:
          panelData = {
            title: 'Information',
            listType: 'disc',
            items: [],
          }
      }

      console.log(`✅ Loaded ${type} with ${panelData.items?.length || 0} items`)
    }

  } catch (error) {
    console.error('❌ InfoPanel error:', error)
  }

  return <InfoPanelClient {...panelData} listType={props.listType || panelData.listType} />
}

export default InfoPanel
