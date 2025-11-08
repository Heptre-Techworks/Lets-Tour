'use client'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/ui'

const badgeVariants = cva(
  // base styles
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-foreground/20 hover:bg-foreground/5',
        gradient:
          'border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]',
      },
      size: {
        sm: 'text-[10px] px-2 py-[2px] xs:text-xs xs:px-2.5 xs:py-0.5 sm:text-sm sm:px-3 sm:py-1',
        md: 'text-xs px-2.5 py-0.5 xs:text-sm xs:px-3 xs:py-1 sm:text-base sm:px-4 sm:py-1.5',
        lg: 'text-sm px-3 py-1 xs:text-base xs:px-4 xs:py-1.5 sm:text-lg sm:px-5 sm:py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
