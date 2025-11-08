import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<
  {
    ref?: React.Ref<HTMLTextAreaElement>
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ref, ...props }) => {
  return (
    <textarea
      className={cn(
        // Base styles
        'flex w-full min-h-[80px] resize-y rounded-md border border-border bg-background text-sm ring-offset-background placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',

        // Responsive padding & font
        'px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4',
        'text-sm sm:text-base md:text-lg',

        // Transitions for smooth UI
        'transition-all duration-200 ease-in-out',

        // Light & dark mode adjustments
        'dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400',

        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Textarea }
