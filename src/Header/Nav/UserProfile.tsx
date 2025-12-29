'use client'
import React from 'react'
import Image from 'next/image'

interface UserProfileProps {
  imageUrl?: string
  altText?: string
  size?: number
}

// no usage of this component in future use

export const UserProfile: React.FC<UserProfileProps> = ({
  imageUrl,
  altText = 'User Profile',
  size = 50,
}) => {
  const defaultProfileImage =
    'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzcyOTkyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'

  const profileImageUrl = imageUrl || defaultProfileImage

  return (
    <div
      className="
        relative shrink-0 cursor-pointer 
        hover:opacity-80 transition-opacity 
        flex items-center justify-center 
        rounded-full overflow-hidden 
        border-2 border-white/20
        bg-gray-200
        sm:w-[40px] sm:h-[40px] 
        md:w-[50px] md:h-[50px] 
        lg:w-[56px] lg:h-[56px]
        w-[36px] h-[36px]
      "
      style={{ maxWidth: size, maxHeight: size }}
    >
      <Image
        src={profileImageUrl}
        alt={altText}
        width={size}
        height={size}
        sizes="(max-width: 640px) 36px, (max-width: 768px) 40px, (max-width: 1024px) 50px, 56px"
        className="
          w-full h-full object-cover 
          rounded-full 
          transition-transform duration-200 
          hover:scale-105
        "
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement
          target.src = `data:image/svg+xml;base64,${btoa(`
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#f3f4f6"/>
              <circle cx="${size / 2}" cy="${size / 3}" r="${size / 6}" fill="#9ca3af"/>
              <path d="M${size / 4} ${(size * 3) / 4}c0-${size / 6} ${size / 6}-${size / 3} ${size / 4}-${size / 3}s${size / 4} ${size / 6} ${size / 4} ${size / 3}" fill="#9ca3af"/>
            </svg>
          `)}`
        }}
      />
    </div>
  )
}
