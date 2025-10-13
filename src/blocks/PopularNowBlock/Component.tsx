'use client';

import React, { useEffect, useRef } from 'react';
import type { PopularNowBlock as PopularNowBlockProps } from '@/payload-types';

type MediaLike = { url?: string | null; alt?: string | null };

const getImageSrc = (card: { image?: MediaLike | string | null; imageUrl?: string | null }) => {
  if (card?.image && typeof card.image === 'object' && 'url' in card.image && card.image?.url) {
    return card.image.url as string;
  }
  if (card?.imageUrl) return card.imageUrl;
  return '';
};

const DestinationCard: React.FC<{ name: string; price: string; src: string; alt?: string | null }> = ({
  name,
  price,
  src,
  alt,
}) => {
  if (!src) return null;
  return (
    <li className="relative w-[300px] sm:w-[350px] md:w-[400px] h-64 flex-shrink-0">
      <img src={src} alt={alt || name} className="w-full h-full object-cover rounded-2xl shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-3xl md:text-4xl font-bold">{name}</h3>
        <p className="text-lg mt-1">
          Starting from <span className="font-semibold">₹{price}</span>
        </p>
      </div>
    </li>
  );
};

const InfiniteScroller: React.FC<{
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  centerOffset?: number;
  transformOrigin?: string;
  alignItems?: string;
}> = ({
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  children,
  centerOffset = 0,
  transformOrigin = 'center',
  alignItems = 'items-center'
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollerInnerRef = useRef<HTMLUListElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Clone items for seamless loop
  useEffect(() => {
    const scroller = scrollerRef.current;
    const scrollerInner = scrollerInnerRef.current;
    if (!scroller || !scrollerInner || scroller.dataset.initialized) return;

    const originalChildren = Array.from(scrollerInner.children);
    originalChildren.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      scrollerInner.appendChild(clone);
    });
    scroller.dataset.initialized = 'true';
  }, [children]);

  // Scaling animation
  useEffect(() => {
    const scroller = scrollerRef.current;
    const scrollerInner = scrollerInnerRef.current;
    if (!scroller || !scrollerInner) return;

    const applyScaling = () => {
      // Guard at the top for type safety
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

export const PopularNow: React.FC<PopularNowBlockProps> = ({
  heading = 'Popular now!',
  subheading = "Today's enemy is tomorrow's friend.",
  pauseOnHover: pauseRaw,
  rows = [],
}) => {
  const pauseOnHover = pauseRaw ?? true;
  return (
    <section className="min-h-screen w-full text-[#111827] font-sans flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl md:text-6xl font-bold flex-shrink-0 pl-[5%]">{heading}</h1>
            <div className="flex-grow w-full border-t-4 border-dotted border-gray-300" />
          </div>
          {subheading ? <p className="text-lg text-gray-500 mt-2 pl-[5%]">{subheading}</p> : null}
        </header>

        <div className="flex flex-col gap-1">
          {Array.isArray(rows) &&
            rows.map((row, idx) => {
              const direction = row?.direction === 'right' ? 'right' : 'left';
              const speedSeconds = typeof row?.speedSeconds === 'number' ? row.speedSeconds : 40;
              const centerOffset = idx === 0 ? -20 : 20;
              const transformOrigin = idx === 0 ? 'bottom' : 'top';
              const alignItems = idx === 0 ? 'items-end' : 'items-start';

              return (
                <InfiniteScroller
                  key={idx}
                  direction={direction}
                  speed={speedSeconds}
                  pauseOnHover={pauseOnHover}
                  centerOffset={centerOffset}
                  transformOrigin={transformOrigin}
                  alignItems={alignItems}
                >
                  {Array.isArray(row?.cards) &&
                    row.cards.map((card: any, i: number) => (
                      <DestinationCard
                        key={`${idx}-${i}`}
                        name={card?.name ?? ''}
                        price={card?.price ?? ''}
                        src={getImageSrc(card)}
                        alt={card?.alt ?? card?.name}
                      />
                    ))}
                </InfiniteScroller>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default PopularNow;
