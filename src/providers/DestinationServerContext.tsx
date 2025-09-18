// src/providers/DestinationServerContext.tsx
import React, { createContext, useContext } from 'react'

export type DestinationDoc = {
  id: string
  name?: string
  summary?: string
  heroImage?: any
  labels?: any[]
}

const Ctx = createContext<DestinationDoc | null>(null)

export const useDestinationServerContext = () => useContext(Ctx)

export const DestinationServerProvider = ({
  value,
  children,
}: {
  value: DestinationDoc
  children: React.ReactNode
}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>
