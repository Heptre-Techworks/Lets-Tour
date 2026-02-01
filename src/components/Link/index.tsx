'use client'

import React from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { usePageTransition } from '@/providers/PageTransitionContext'
import type { Page, Post } from '@/payload-types' // Adjust types as needed based on your project

interface CustomLinkProps extends LinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  children: React.ReactNode
  className?: string
  href: string | null | undefined // Handled safely below
}

export const CustomLink: React.FC<CustomLinkProps> = ({
  children,
  href,
  onClick,
  ...props
}) => {
  const router = useRouter()
  const { triggerTransition } = usePageTransition()

  const safeHref = href || '#'

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) {
      onClick(e)
    }

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) {
      return
    }

    const isInternal = safeHref.startsWith('/') || safeHref.startsWith('.')
    const isAnchor = safeHref.startsWith('#')
    
    // Check key targets where we want the explicit loader
    // If target="_blank", we should not trigger transition
    if (props.target === '_blank') return

    const currentPath = window.location.pathname
    
    if (isInternal && !isAnchor) {
        // Prevent transition loop if navigating to the same page
        if (safeHref === currentPath) {
             return onClick ? onClick(e) : undefined
        }

      e.preventDefault()
      triggerTransition()
      setTimeout(() => {
        router.push(safeHref)
      }, 100) 
    }
  }

  return (
    <Link href={safeHref} onClick={handleTransition} {...props}>
      {children}
    </Link>
  )
}

// --- CMSLink Wrapper for Payload Data ---

type CMSLinkType = {
  type?: 'custom' | 'reference' | null
  url?: string | null
  newTab?: boolean | null
  reference?: {
    value: string | Page | Post | any
    relationTo: 'pages' | 'posts' | 'destinations' | 'packages'
  } | null
  label?: string | null
  appearance?: 'default' | 'primary' | 'secondary' | null
  children?: React.ReactNode
  className?: string
}

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  url,
  newTab,
  reference,
  label,
  children,
  className,
  ...rest
}) => {
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value?.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  /* Ensure we don't pass 'appearance' or other non-DOM props to CustomLink if they leak in via ...rest */ 
  // But CMSLinkType destructuring handles most.

  return (
    <CustomLink
      href={href}
      className={className}
      {...newTabProps}
      {...rest}
    >
      {label && label}
      {children && children}
    </CustomLink>
  )
}

export default CustomLink
