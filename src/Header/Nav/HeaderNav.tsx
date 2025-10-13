'use client'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { Navigation } from './Navigation'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  return <Navigation data={data} />
}
