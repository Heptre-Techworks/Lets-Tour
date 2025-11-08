import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<
  {
    ref?: React.Ref<HTMLInputElement>
  } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ type, className, ref, ...props }) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        `
        flex w-full 
        rounded-md border border-gray-300 
        bg-background text-sm sm:text-base md:text-[16px] 
        px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 
        h-9 sm:h-10 md:h-11
        ring-offset-background
        file:border-0 file:bg-transparent file:text-sm file:font-medium 
        placeholder:text-gray-500 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50
        transition-all duration-200 ease-in-out
      `,
        className,
      )}
      {...props}
    />
  )
}

export { Input }
