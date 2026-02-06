'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePageTransition } from '@/providers/PageTransitionContext'
import { JourneyLoader } from '@/components/JourneyLoader'

// --- Visual Component ---
// Exported for use in loading.tsx (which manages its own lifecycle)
export const PreloaderVisual: React.FC<{
  isExiting?: boolean
  text: string
}> = ({ isExiting = false, text }) => {
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center transform scale-150">
         <JourneyLoader text={text} className="text-white" />
      </div>
    </div>
  )
}

export const GlobalPreloader: React.FC = () => {
  const { isTransitioning, endTransition, contentLoading } = usePageTransition()
  
  // Transition logic state
  const [show, setShow] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  
  // Text cycling state
  const [textIndex, setTextIndex] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. Handle Navigation Completion
  // When pathname or searchParams change, it means the new route has mounted.
  // We trigger the exit sequence.
  // Track previous path to detect changes
  // Initialize with null to ensure we detect a "change" even if the component re-mounts on the new page
  const [prevPath, setPrevPath] = useState<string | null>(null)
  const [prevSearchParams, setPrevSearchParams] = useState<string | null>(null)

  // 1. Handle Navigation Completion
  useEffect(() => {
    const currentParams = searchParams?.toString()
    if (pathname !== prevPath || currentParams !== prevSearchParams) {
      setPrevPath(pathname)
      setPrevSearchParams(currentParams || '')
      
      if (isTransitioning) {
        // Only end transition if we were actually transitioning
        const timer = setTimeout(() => {
          endTransition()
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname, searchParams, isTransitioning, endTransition, prevPath, prevSearchParams])

  // Safety Net: If transitioning for more than 6 seconds, force end
  useEffect(() => {
    if (isTransitioning) {
        const timer = setTimeout(() => {
            console.warn('[GlobalPreloader] Safety timeout triggered - forcing transition end')
            endTransition()
        }, 6000)
        return () => clearTimeout(timer)
    }
  }, [isTransitioning, endTransition])

  // 2. Control Visibility based on Context
  useEffect(() => {
    if (isTransitioning) {
      // Start showing loader immediately
      setShow(true)
      setIsExiting(false)
      setTextIndex(0)
    } else {
      // Stop showing loader (start exit animation)
      // Only if we are currently showing it AND content is not loading
      if (show && !isExiting && !contentLoading) {
        const minTime = 800 // Ensure it's visible for at least a moment if it was quick
        const exitTimer = setTimeout(() => {
          setIsExiting(true)
          setTimeout(() => setShow(false), 800) // Unmount after fade out
        }, minTime)
        return () => clearTimeout(exitTimer)
      }
    }
  }, [isTransitioning, show, isExiting, contentLoading])

  // 3. Initial Load Handling (Show once on first mount)
  useEffect(() => {
    if (contentLoading) return

    // This runs only once on initial full page load
    const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => setShow(false), 800)
    }, 2500) // Initial load stays longer for branding
    return () => clearTimeout(timer)
  }, [contentLoading])


  // --- Content Logic ---

  // Extract major segment for dynamic text
  const exploreName = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 1 && (segments[0] === 'destinations' || segments[0] === 'packages')) {
        const raw = segments[segments.length - 1]
        return raw.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    }
    return null
  }, [pathname])

  const destinationText = exploreName || 'Lets Tour'

  // Animation phrases
  const phrases = useMemo(() => [
    `Preparing for ${exploreName || 'your trip'}...`,
    'Checking weather conditions...',
    'Packing bags...',
    'Finding best routes...',
    'Checking maps...',
    'Reviewing itinerary...',
    'Booking local guides...',
    'Polishing sunglasses...',
    'Fueling jet...',
    'Securing overhead bin...',
    `Welcome to ${destinationText}!`,
  ], [exploreName, destinationText])

  // Cycle text
  useEffect(() => {
    if (isExiting) return
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev < phrases.length - 1 ? prev + 1 : prev))
    }, 800) // Change text every 800ms
    return () => clearInterval(interval)
  }, [isExiting, phrases.length])

  if (!show) return null

  return <PreloaderVisual isExiting={isExiting} text={phrases[textIndex]} />
}
