'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type PageTransitionContextType = {
  isTransitioning: boolean
  triggerTransition: () => void
  endTransition: () => void
  contentLoading: boolean
  setContentLoading: (loading: boolean) => void
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isTransitioning: false,
  triggerTransition: () => {},
  endTransition: () => {},
  contentLoading: false,
  setContentLoading: () => {},
})

export const usePageTransition = () => useContext(PageTransitionContext)

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)

  const triggerTransition = () => {
    setIsTransitioning(true)
  }

  const endTransition = () => {
    setIsTransitioning(false)
  }

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, triggerTransition, endTransition, contentLoading, setContentLoading }}>
      {children}
    </PageTransitionContext.Provider>
  )
}
