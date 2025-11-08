'use client'

import { cn } from '@/utilities/ui'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import * as React from 'react'

const Checkbox: React.FC<
  {
    ref?: React.Ref<HTMLButtonElement>
  } & React.ComponentProps<typeof CheckboxPrimitive.Root>
> = ({ className, ref, ...props }) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // base shape & layout
      'peer flex items-center justify-center rounded border border-primary transition-all duration-200',

      // responsive sizing for better tap targets
      'h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6',

      // focus and interaction states
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',

      // checked state styling
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',

      // hover and active feel
      'hover:border-primary/70 active:scale-[0.95]',

      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        'flex items-center justify-center text-current transition-transform duration-200',
      )}
    >
      <Check className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)

export { Checkbox }
