'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-background hover:bg-card hover:text-accent-foreground',
        ghost: 'hover:bg-card hover:text-accent-foreground',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all',
      },
      size: {
        clear: '',
        sm: 'h-9 rounded px-2.5 text-xs xs:h-9 xs:px-3 xs:text-sm sm:h-10 sm:px-3.5 sm:text-sm',
        default:
          'h-10 rounded-md px-3.5 py-2 text-sm xs:h-11 xs:px-4 xs:text-base sm:h-12 sm:px-5 sm:text-base',
        lg: 'h-11 rounded-lg px-5 text-base xs:h-12 xs:px-6 xs:text-lg sm:h-14 sm:px-8 sm:text-lg',
        icon: 'h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ size, variant }), className)} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
