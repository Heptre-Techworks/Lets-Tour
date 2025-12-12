// src/components/site/Header/Nav/HoverMenu.tsx
'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState, useCallback } from 'react'

type Item = { id: string; name: string; slug: string }

interface HoverMenuProps {
    label: string
    endpoint: string
    hrefBase: string
}

// Custom hook to reliably detect if the screen size is considered desktop (>= 640px/sm).
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            // Check if window width matches the Tailwind 'sm' breakpoint (640px) or larger
            setIsDesktop(window.matchMedia('(min-width: 640px)').matches);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return isDesktop;
};


export const HoverMenu: React.FC<HoverMenuProps> = ({ label, endpoint, hrefBase }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<Item[]>([])
    const isDesktop = useIsDesktop(); 
    
    // Ref for controlling the hover-out delay (Desktop logic)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const delay = 300 

    const closeMenu = () => setOpen(false)

    // FIX: Only toggle the menu if we are NOT on a desktop screen.
    const handleClick = () => {
        if (!isDesktop) {
            setOpen(prevOpen => !prevOpen)
        }
    }

    // Handle cursor entering the container (Desktop hover-in)
    const handleEnter = useCallback(() => {
        // Clear any pending timeout from leaving the container
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setOpen(true)
    }, [])

    // Handle cursor leaving the container (Desktop hover-out with delay)
    const handleLeave = useCallback(() => {
        // Start a timeout to close the menu
        timeoutRef.current = setTimeout(() => {
            setOpen(false)
        }, delay)
    }, [delay])

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    // Data fetching effect
    useEffect(() => {
        if (open && items.length === 0 && !loading) {
            setLoading(true)
            fetch(endpoint, { next: { revalidate: 60 } })
                .then((r) => r.json())
                .then((data) => {
                    const docs = Array.isArray(data?.docs) ? data.docs : []
                    setItems(docs.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })))
                })
                .finally(() => setLoading(false))
        }
    }, [open, items.length, loading, endpoint])
    
    // ----------------------------------------------------
    // JSX
    // ----------------------------------------------------

    return (
        // The container handles both hover (desktop) and click (mobile) behavior
        <div 
            className="relative" 
            onMouseEnter={handleEnter} // Desktop hover-in
            onMouseLeave={handleLeave} // Desktop hover-out
        >
            {/* Label button: Used for both hover and click */}
            <button
                type="button"
                className="
                    cursor-pointer font-sans leading-[0.88] text-[14px] sm:text-[20px] md:text-[20px] lg:text-[24px]
                    font-medium
                    text-black md:text-white
                    tracking-[-0.011em] 
                    hover:text-gray-700 md:hover:text-gray-200 
                    transition-colors
                "
                onClick={handleClick} // Click handler runs toggle only on mobile
                aria-expanded={open} 
                aria-controls="mobile-menu desktop-menu"
            >
                <span className="align-middle">{label}</span>
            </button>

            {/* ------------------------------------------------------------------ */}
            {/* 1. MOBILE SLIDE-IN MENU (Fixed, Full-Screen, hidden on 'sm' and up) */}
            {/* ------------------------------------------------------------------ */}
            <div
                id="mobile-menu"
                className={[
                    // Base Mobile Styles: Full height, fixed, slide-in from right
                    'fixed inset-y-0 right-0 z-50 transform transition-all duration-300 ease-in-out',
                    'w-full bg-white shadow-2xl ring-1 ring-black/10',
                    'p-4 flex flex-col','sm:hidden', 
                    // Visibility Logic
                    open
                        ? 'translate-x-0 opacity-100 pointer-events-auto' 
                        : 'translate-x-full opacity-0 pointer-events-none', 
                ].join(' ')}
                role="menu"
                aria-label={`${label} mobile menu`}
            >
                
                {/* --- MOBILE HEADER --- */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <button
                        onClick={closeMenu}
                        aria-label="Back"
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                {/* List Container (Handles scrolling) */}
                <div className="flex-grow overflow-y-auto">
                    {loading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                    ) : (
                        <ul className="max-h-[80vh]">
                            {/* Removed redundant list title inside UL, relying on main header */}
                            {items.map((it) => (
                                <li key={it.id} role="none">
                                    <Link
                                        href={`${hrefBase}/${it.slug}`}
                                        className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded" // Standardized py-2 padding
                                        role="menuitem"
                                        onClick={closeMenu}
                                    >
                                        {it.name}
                                    </Link>
                                </li>
                            ))}
                            {items.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No items</li>}
                        </ul>
                    )}
                </div>
            </div>
            
            {/* 2. DESKTOP HOVER MENU (Absolute, Fade-in, hidden below 'sm') */}
            <div
                id="desktop-menu"
                className={[
                    // Display only on desktop/tablet size
                    'hidden sm:block',
                    
                    // Positioning and styling (from your request)
                    'absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50',
                    'w-[320px] rounded-lg bg-white shadow-xl ring-1 ring-black/5',
                    'px-2 py-2 transition-opacity duration-150',
                    
                    // Visibility based on 'open' state
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                role="menu"
                aria-label={`${label} desktop menu`}
            >
                {loading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                ) : (
                    <ul className="max-h-[60vh] overflow-auto">
                         {/* Desktop Header */}
                        <h2 className="text-xs font-semibold uppercase text-gray-400 px-3 pt-1 pb-2">
                            {label} Menu
                        </h2>
                        {items.map((it) => (
                            <li key={it.id} role="none">
                                <Link
                                    href={`${hrefBase}/${it.slug}`}
                                    className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded"
                                    role="menuitem"
                                    onClick={closeMenu} 
                                >
                                    {it.name}
                                </Link>
                            </li>
                        ))}
                        {items.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No items</li>}
                    </ul>
                )}
            </div>
        </div>
    )
}