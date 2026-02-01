'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'

export const GlobalPreloader: React.FC = () => {
  const [show, setShow] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [textIndex, setTextIndex] = useState(0)
  const pathname = usePathname()
  
  // Extract major segment
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
  const phrases = [
    `Preparing for ${exploreName || 'your trip'}...`,
    'Packing bags...',
    'Checking maps...',
    'Fueling jet...',
    `Welcome to ${destinationText}!`,
  ]

  // Cycle text
  useEffect(() => {
    if (isExiting) return
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev < phrases.length - 1 ? prev + 1 : prev))
    }, 800) // Change text every 800ms
    return () => clearInterval(interval)
  }, [isExiting, phrases.length])

  // Lifecycle
  useEffect(() => {
    // Force show for at least 2.5s for animation, then wait up to 8s max
    const minTime = 2500
    const maxTime = 8000

    const exitTimer = setTimeout(() => {
      setIsExiting(true) // Trigger exit animation (fade out)
      setTimeout(() => setShow(false), 800) // Unmount after fade
    }, minTime)

    return () => clearTimeout(exitTimer)
  }, [])

  if (!show) return null

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
          animation: planeJourney 2s ease-in-out forwards;
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
             {phrases[textIndex]}
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
