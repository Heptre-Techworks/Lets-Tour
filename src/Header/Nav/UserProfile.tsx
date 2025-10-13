'use client'
import React from 'react'
import Image from 'next/image'

interface UserProfileProps {
  imageUrl?: string
  altText?: string
  size?: number
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  imageUrl,
  altText = "User Profile",
  size = 50
}) => {
  const defaultProfileImage = "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzcyOTkyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"

  const profileImageUrl = imageUrl || defaultProfileImage

  return (
    <div 
      className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
      style={{ width: size, height: size }}
    >
      <Image
        src={profileImageUrl}
        alt={altText}
        width={size}
        height={size}
        className="w-full h-full rounded-full object-cover border-2 border-white/20"
        onError={(e) => {
          const target = e.currentTarget;
          target.src = `data:image/svg+xml;base64,${btoa(`
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#f3f4f6"/>
              <circle cx="${size/2}" cy="${size/3}" r="${size/6}" fill="#9ca3af"/>
              <path d="M${size/4} ${size*3/4}c0-${size/6} ${size/6}-${size/3} ${size/4}-${size/3}s${size/4} ${size/6} ${size/4} ${size/3}" fill="#9ca3af"/>
            </svg>
          `)}`
        }}
      />
    </div>
  )
}
