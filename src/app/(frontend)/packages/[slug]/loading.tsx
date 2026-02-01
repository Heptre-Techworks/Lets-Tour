
import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-gray-50">
      <div className="relative w-24 h-24">
         <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
         <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading destination...</p>
    </div>
  )
}
