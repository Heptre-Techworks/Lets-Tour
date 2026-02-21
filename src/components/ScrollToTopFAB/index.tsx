'use client'

import React, { useState, useEffect } from 'react'

export const ScrollToTopFAB: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Toggle visibility based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      // Show if scrolled down past 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    // Check initial state
    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to Top"
      className={`fixed bottom-[100px] left-4 z-50 p-3 rounded-full bg-black/80 hover:bg-[#FBAE3D] text-white shadow-lg backdrop-blur-sm transition-all duration-300 transform flex items-center justify-center
        ${isVisible ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'}
      `}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
