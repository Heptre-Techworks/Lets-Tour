'use client'

import React, { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { MessageCircle } from 'lucide-react'

const texts = [
  "Chat with us",
  "Plan your trip",
  "Need help?",
  "Contact us"
]

export const WhatsAppFAB: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length)
        setIsVisible(true)
      }, 500) // Wait for fade out before changing text
    }, 4000) // Change text every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <a
      href="https://wa.me/917904277199"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      {/* Animating Text Bubble */}
      <div 
        className={`
          hidden md:block bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg font-medium text-sm
          transform transition-all duration-500 ease-in-out border border-gray-100
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
      >
        {texts[index]}
        {/* Little triangle pointing to the button */}
        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white transform -translate-y-1/2 rotate-45 border-t border-r border-gray-100"></div>
      </div>

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-2xl transition-transform duration-300 hover:scale-110">
        <FaWhatsapp className="text-white w-8 h-8" />
        
        {/* Pulse Effect */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 animate-ping"></span>
      </div>
    </a>
  )
}
