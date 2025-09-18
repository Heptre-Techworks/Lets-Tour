// app/destinations/[slug]/page.client.tsx
'use client'
import React, { useEffect } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])
  return null
}
export default PageClient
