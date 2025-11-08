import type { ButtonProps } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    aria-label="pagination"
    role="navigation"
    className={cn(
      `
      mx-auto flex w-full flex-wrap justify-center 
      gap-2 sm:gap-3 md:gap-4 
      px-2 sm:px-4 py-2 sm:py-3 
      text-xs sm:text-sm md:text-base
    `,
      className,
    )}
    {...props}
  />
)

const PaginationContent: React.FC<
  { ref?: React.Ref<HTMLUListElement> } & React.HTMLAttributes<HTMLUListElement>
> = ({ className, ref, ...props }) => (
  <ul
    ref={ref}
    className={cn(
      `
      flex flex-row flex-wrap items-center justify-center 
      gap-1.5 sm:gap-2 md:gap-3 
      transition-all duration-200 ease-in-out
    `,
      className,
    )}
    {...props}
  />
)

const PaginationItem: React.FC<
  { ref?: React.Ref<HTMLLIElement> } & React.HTMLAttributes<HTMLLIElement>
> = ({ className, ref, ...props }) => (
  <li ref={ref} className={cn('flex-shrink-0', className)} {...props} />
)

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'button'>

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <button
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        size,
        variant: isActive ? 'outline' : 'ghost',
      }),
      `
        min-w-[34px] sm:min-w-[40px] md:min-w-[44px] 
        h-[34px] sm:h-[40px] md:h-[44px]
        text-[12px] sm:text-[14px] md:text-[15px]
        rounded-md sm:rounded-lg
        transition-all duration-200 ease-in-out
        hover:bg-gray-100 active:scale-[0.97]
      `,
      className,
    )}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn(
      `
        flex items-center justify-center 
        gap-1 sm:gap-1.5 
        px-2 sm:px-3 md:px-4 
        py-1.5 sm:py-2
        text-[12px] sm:text-[14px]
      `,
      className,
    )}
    {...props}
  >
    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="hidden xs:inline">Previous</span>
  </PaginationLink>
)

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn(
      `
        flex items-center justify-center 
        gap-1 sm:gap-1.5 
        px-2 sm:px-3 md:px-4 
        py-1.5 sm:py-2
        text-[12px] sm:text-[14px]
      `,
      className,
    )}
    {...props}
  >
    <span className="hidden xs:inline">Next</span>
    <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  </PaginationLink>
)

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(
      `
        flex h-[34px] sm:h-[40px] md:h-[44px] 
        w-[34px] sm:w-[40px] md:w-[44px] 
        items-center justify-center
      `,
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4 text-gray-500" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
