'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePageTransition } from '@/providers/PageTransitionContext'

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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes planeJourney {
          0% { transform: scale(1) rotate(0deg); }
          20% { transform: scale(1.2) rotate(15deg); } 
          40% { transform: scale(1.2) translateX(100vw) rotate(15deg); opacity: 0; }
          41% { transform: scale(1) translateX(-100vw) rotate(-15deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1) translateX(0) rotate(0deg); }
        }
        .animate-plane-journey {
          animation: planeJourney 2s ease-in-out forwards infinite;
        }
      `}} />

      <div className="relative flex flex-col items-center">
        {/* Pulsing Circle Background */}
        <div className="absolute inset-0 bg-[#FBAE3D] rounded-full opacity-20 animate-ping scale-150"></div>
        
        {/* Logo / Plane Icon Container */}
        <div className="relative z-10 w-32 h-32 mb-8 flex items-center justify-center">
           <svg 
             xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 24 24" 
             fill="currentColor" 
             className="w-16 h-16 text-[#FBAE3D] animate-plane-journey"
           >
             <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
           </svg>
        </div>

        {/* Loading Text */}
        <div className="h-8"> {/* Fixed height to prevent jump */}
          <p className="text-white font-sans text-lg tracking-widest uppercase font-bold text-center transition-all duration-300 transform">
             {text}
          </p>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2 mt-4 justify-center">
           {[0, 1, 2].map(i => (
             <span key={i} className="w-2 h-2 bg-[#FBAE3D] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></span>
           ))}
        </div>
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
