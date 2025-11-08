'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'

const Card: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      // Base styles
      'rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300',

      // Responsive adjustments
      'p-3 xs:p-4 sm:p-6 md:p-8',
      'hover:shadow-md sm:hover:shadow-lg',
      'max-w-full',

      className,
    )}
    {...props}
  />
)

const CardHeader: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5',
      // Responsive padding
      'p-3 xs:p-4 sm:p-6 md:p-8',
      className,
    )}
    {...props}
  />
)

const CardTitle: React.FC<
  { ref?: React.Ref<HTMLHeadingElement> } & React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, ref, ...props }) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold leading-none tracking-tight transition-all duration-200',
      // Responsive typography
      'text-lg xs:text-xl sm:text-2xl md:text-3xl',
      className,
    )}
    {...props}
  />
)

const CardDescription: React.FC<
  { ref?: React.Ref<HTMLParagraphElement> } & React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ref, ...props }) => (
  <p
    ref={ref}
    className={cn(
      'text-muted-foreground transition-all duration-200',
      // Responsive text scaling
      'text-xs xs:text-sm sm:text-base md:text-lg',
      className,
    )}
    {...props}
  />
)

const CardContent: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      // Responsive padding
      'p-3 xs:p-4 sm:p-6 md:p-8 pt-0',
      className,
    )}
    {...props}
  />
)

const CardFooter: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col xs:flex-row items-start xs:items-center justify-between',
      // Responsive spacing
      'p-3 xs:p-4 sm:p-6 md:p-8 pt-0 gap-2 xs:gap-4',
      className,
    )}
    {...props}
  />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
