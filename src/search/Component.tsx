'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 md:px-8">
      <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-lg flex items-center">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="text"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search..."
          className="
            w-full 
            rounded-md 
            border 
            border-border 
            bg-background 
            text-foreground 
            px-4 py-2 
            text-sm
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary/40 
            transition-all
            sm:text-base
            md:text-lg
          "
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
