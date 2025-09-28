// src/blocks/PopularNow/Component.tsx
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
    <li className="relative w-[300px] sm:w-[350px] md:w-[400px] h-64 flex-shrink-0 mx-4">
      <img src={src} alt={alt || name} className="w-full h-full object-cover rounded-2xl shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl" />
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-4xl font-bold">{name}</h3>
        <p className="text-lg mt-1">
          Starting from <span className="font-semibold">₹ {price}</span>
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
}> = ({ direction = 'left', speed = 40, pauseOnHover = true, children }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (!scroller.hasAttribute('data-animated')) {
      scroller.setAttribute('data-animated', 'true');
      const scrollerInner = scroller.querySelector('.scroller-inner');
      const scrollerContent = scrollerInner ? Array.from(scrollerInner.children) : [];

      scrollerContent.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        scrollerInner?.appendChild(clone);
      });
    }
  }, [children]);

  const directionClass = direction === 'left' ? 'scroll-left' : 'scroll-right';

  return (
    <div
      ref={scrollerRef}
      className="scroller overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
      style={{ ['--duration' as any]: `${Math.max(5, speed)}s` }}
    >
      <ul className={`flex gap-4 w-max animate-infinite-scroll ${directionClass}`}>
        <div className="scroller-inner flex">{children}</div>
      </ul>

      <style>{`
        @keyframes scroll-left { to { transform: translateX(calc(-50% - 0.5rem)); } }
        @keyframes scroll-right { to { transform: translateX(calc(50% + 0.5rem)); } }
        .scroller-inner { animation-play-state: running; }
        .scroller:hover .scroller-inner { animation-play-state: ${pauseOnHover ? 'paused' : 'running'}; }
        .animate-infinite-scroll.scroll-left .scroller-inner { animation: scroll-left var(--duration, 40s) linear infinite; }
        .animate-infinite-scroll.scroll-right .scroller-inner { animation: scroll-right var(--duration, 40s) linear infinite; }
      `}</style>
    </div>
  );
};

export const PopularNow: React.FC<PopularNowBlockProps> = ({
  heading = 'Popular now!',
  subheading = "Today’s enemy is tomorrow’s friend.",
  pauseOnHover: pauseRaw,
  rows = [],
}) => {
  const pauseOnHover = pauseRaw ?? true;
  return (
    <section className="min-h-screen w-full bg-[#F3F4F6] text-[#111827] font-sans flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl md:text-6xl font-bold flex-shrink-0">{heading}</h1>
            <div className="flex-grow w-full border-t-4 border-dotted border-gray-300" />
          </div>
          {subheading ? <p className="text-lg text-gray-500 mt-2">{subheading}</p> : null}
        </header>

        <div className="flex flex-col gap-8">
          {Array.isArray(rows) &&
            rows.map((row, idx) => {
              const direction = row?.direction === 'right' ? 'right' : 'left';
              const speedSeconds = typeof row?.speedSeconds === 'number' ? row.speedSeconds : 40;
              return (
                <InfiniteScroller key={idx} direction={direction} speed={speedSeconds} pauseOnHover={pauseOnHover}>
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
