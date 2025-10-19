'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Amiri } from 'next/font/google';

// Configure Amiri font for title only
const amiri = Amiri({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

type MediaLike = { url?: string | null; alt?: string | null };

type CardData = {
  name?: string;
  price?: string;
  image?: MediaLike | string | null;
  imageUrl?: string | null;
  alt?: string | null;
  slug?: string;
  href?: string;
}

type RowData = {
  direction: 'left' | 'right';
  speedSeconds: number;
  cards: CardData[];
}

const getImageSrc = (card: CardData) => {
  if (card?.image && typeof card.image === 'object' && 'url' in card.image && card.image?.url) {
    return card.image.url as string;
  }
  if (card?.imageUrl) return card.imageUrl;
  return '';
};

const DestinationCard: React.FC<{ 
  name: string; 
  price: string; 
  src: string; 
  alt?: string | null;
  href?: string;
}> = ({
  name,
  price,
  src,
  alt,
  href,
}) => {
  const cardContent = (
    <li className="relative w-[300px] sm:w-[350px] md:w-[400px] h-64 flex-shrink-0">
      {src ? (
        <img 
          src={src} 
          alt={alt || name} 
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-8xl mb-2">📍</div>
            <div className="text-sm font-medium">No Image</div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-3xl md:text-4xl font-bold">{name}</h3>
        <p className="text-lg mt-1">
          Starting from <span className="font-semibold">{price}</span>
        </p>
      </div>
    </li>
  );

  if (href && href !== '#') {
    return (
      <Link 
        href={href}
        className="block hover:shadow-2xl transition-shadow duration-300"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const InfiniteScroller: React.FC<{
  direction: 'left' | 'right';
  speed: number;
  pauseOnHover: boolean;
  children: React.ReactNode;
  centerOffset: number;
  transformOrigin: string;
  alignItems: string;
}> = ({
  direction,
  speed,
  pauseOnHover,
  children,
  centerOffset,
  transformOrigin,
  alignItems
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollerInnerRef = useRef<HTMLUListElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    console.log(`🎬 InfiniteScroller - Direction: ${direction}, Speed: ${speed}s`)
  }, [direction, speed])

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scrollerInner = scrollerInnerRef.current;
    if (!scroller || !scrollerInner || scroller.dataset.initialized) return;

    const originalChildren = Array.from(scrollerInner.children);
    if (originalChildren.length === 0) return;
    
    originalChildren.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      scrollerInner.appendChild(clone);
    });
    scroller.dataset.initialized = 'true';
  }, [children]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const scrollerInner = scrollerInnerRef.current;
    if (!scroller || !scrollerInner) return;

    const applyScaling = () => {
      if (!scrollerRef.current || !scrollerInnerRef.current) return;

      const scrollerWidth = scrollerRef.current.offsetWidth;
      const offsetPixels = scrollerWidth * (centerOffset / 100);
      const scrollerCenterX = (scrollerWidth / 2) + offsetPixels;
      const scrollerRect = scrollerRef.current.getBoundingClientRect();

      const children = Array.from(scrollerInnerRef.current.children) as HTMLLIElement[];
      children.forEach(child => {
        const childRect = child.getBoundingClientRect();
        const childCenterX = childRect.left - scrollerRect.left + childRect.width / 2;
        const distanceFromCenter = Math.abs(scrollerCenterX - childCenterX);
        const scale = Math.max(0.8, 1 - (distanceFromCenter / scrollerWidth));
        child.style.transformOrigin = transformOrigin;
        child.style.transform = `scale(${scale})`;
        child.style.transition = 'transform 150ms linear';
      });
    };

    const updateLoop = () => {
      applyScaling();
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [centerOffset, transformOrigin]);

  const directionClass = direction === 'left' ? 'scroll-left' : 'scroll-right';

  return (
    <div ref={scrollerRef} className="scroller overflow-hidden">
      <ul
        ref={scrollerInnerRef}
        className={`flex w-max ${alignItems} py-2 scroller-inner ${directionClass}`}
        style={{ '--duration': `${speed}s` } as React.CSSProperties}
      >
        {children}
      </ul>
      <style>{`
        @keyframes scroll-left { 
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); } 
        }
        @keyframes scroll-right { 
          from { transform: translateX(-50%); }
          to { transform: translateX(0%); } 
        }
        .scroller-inner.scroll-left { animation: scroll-left var(--duration, 40s) linear infinite; }
        .scroller-inner.scroll-right { animation: scroll-right var(--duration, 40s) linear infinite; }
        .scroller:hover .scroller-inner { 
          animation-play-state: ${pauseOnHover ? 'paused' : 'running'}; 
        }
      `}</style>
    </div>
  );
};

export const PopularNowClient: React.FC<{
  heading?: string;
  subheading?: string;
  pauseOnHover?: boolean;
  rows: RowData[];
}> = ({
  heading = 'Popular now!',
  subheading = "Today's enemy is tomorrow's friend.",
  pauseOnHover = true,
  rows = [],
}) => {
  useEffect(() => {
    console.log('🎨 CLIENT - Received rows:', rows?.length)
    rows?.forEach((row: RowData, idx: number) => {
      console.log(`🎨 Row ${idx + 1}: ${row.cards.length} cards, direction: ${row.direction}, speed: ${row.speedSeconds}s`)
    })
  }, [rows])
  
  return (
    <section className="min-h-screen w-full text-[#111827] font-sans flex flex-col justify-center py-16">
      {/* Header with constrained width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <header>
            <div className="flex items-center gap-6">
              {/* Apply Amiri font to heading only */}
              <h1 className={`${amiri.className} text-5xl md:text-6xl font-bold flex-shrink-0`}>
                {heading}
              </h1>
              <div className="flex-grow w-full border-t-4 border-dotted border-gray-300" />
            </div>
            {/* Subtitle without custom font */}
            {subheading ? (
              <p className="text-lg text-gray-500 mt-2">
                {subheading}
              </p>
            ) : null}
          </header>
        </div>
      </div>

      {/* Edge-to-edge scrolling content */}
      <div className="flex flex-col gap-1 w-full">
        {Array.isArray(rows) && rows.length > 0 ? (
          rows.map((row, idx) => {
            if (!row?.cards || row.cards.length === 0) {
              console.warn(`⚠️ Row ${idx + 1} has no cards`)
              return null;
            }

            const centerOffset = idx === 0 ? -20 : 20;
            const transformOrigin = idx === 0 ? 'bottom' : 'top';
            const alignItems = idx === 0 ? 'items-end' : 'items-start';

            return (
              <InfiniteScroller
                key={idx}
                direction={row.direction}
                speed={row.speedSeconds}
                pauseOnHover={pauseOnHover}
                centerOffset={centerOffset}
                transformOrigin={transformOrigin}
                alignItems={alignItems}
              >
                {row.cards.map((card: CardData, i: number) => (
                  <DestinationCard
                    key={`${idx}-${i}`}
                    name={card?.name ?? ''}
                    price={card?.price ?? ''}
                    src={getImageSrc(card)}
                    alt={card?.alt ?? card?.name}
                    href={card?.href}
                  />
                ))}
              </InfiniteScroller>
            );
          }).filter(Boolean)
        ) : (
          <div className="text-center text-gray-500 py-20">
            No content configured. Please add rows in the admin panel.
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularNowClient;
