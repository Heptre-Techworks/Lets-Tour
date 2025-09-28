// src/blocks/UpDownCarousel/Component.tsx
'use client';

import React, { useRef } from 'react';
import type { UpDownCardCarouselBlock as UpDownCardCarouselBlockProps } from '@/payload-types';

type MediaLike = { url?: string | null; alt?: string | null };

type CardLike = {
  name?: string | null;
  details?: string | null;
  discount?: string | null;
  price?: number | string | null;
  image?: MediaLike | string | null;
  imageUrl?: string | null;
  alt?: string | null;
};

const isMediaLike = (v: unknown): v is MediaLike =>
  !!v && typeof v === 'object' && ('url' in (v as Record<string, unknown>) || 'alt' in (v as Record<string, unknown>));

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (typeof img === 'string' && img) return img;
  if (isMediaLike(img) && img.url) return img.url;
  if (url) return url;
  return '';
};

const HeartIcon: React.FC<{ isFavorite: boolean; onClick: () => void }> = ({ isFavorite, onClick }) => (
  <svg
    onClick={onClick}
    className={`w-6 h-6 cursor-pointer transition-all duration-300 ease-in-out ${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-label="Favorite"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// Child card component so hooks live at top level of a component (not inside map)
const CarouselCard: React.FC<{ card: CardLike; isEven: boolean }> = ({ card, isEven }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const priceNum =
    typeof card?.price === 'string' ? Number(card.price) : typeof card?.price === 'number' ? card.price : 0;
  const safePrice = Number.isFinite(priceNum) ? priceNum : 0;
  const formattedPrice = new Intl.NumberFormat('en-IN').format(safePrice);

  const imgSrc = getImageSrc(card?.image, card?.imageUrl);
  const alt =
    (card?.alt && String(card.alt)) ||
    (isMediaLike(card?.image) && card?.image?.alt) ||
    card?.name ||
    'Image';

  return (
    <div
      className={`relative flex-shrink-0 w-[280px] h-[400px] rounded-2xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:scale-105 ${
        isEven ? '-translate-y-4' : 'translate-y-4'
      }`}
    >
      {imgSrc ? (
        // Note: Using <img> retains current behavior; Next.js recommends <Image /> for perf
        // Replace with next/image if desired to remove the lint warning.
        <img src={imgSrc} alt={alt ?? 'Image'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full bg-gray-300" aria-hidden="true" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-0 p-5 flex flex-col text-white">
        <div className="flex justify-between items-start">
          {card?.discount ? (
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{card.discount}</span>
          ) : (
            <span />
          )}
          <HeartIcon isFavorite={isFavorite} onClick={() => setIsFavorite(v => !v)} />
        </div>

        <div className="mt-auto">
          <h3 className="text-3xl font-bold">{card?.name ?? ''}</h3>
          {card?.details ? <p className="text-sm opacity-90">{card.details}</p> : null}
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-2xl font-bold">₹ {formattedPrice}</span>
              <span className="text-sm opacity-80 ml-1">(per person)</span>
            </div>
            <button
              className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center transform transition-transform duration-300 hover:bg-gray-200 hover:scale-110"
              type="button"
              aria-label="View"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpDownCardCarousel: React.FC<UpDownCardCarouselBlockProps> = ({
  heading = 'In Season',
  subheading = "Today's enemy is tomorrow's friend.*",
  cards = [],
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -300 : 300;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-gray-100 font-sans px-4 sm:px-8 py-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8 px-2">
          <h1 className="text-5xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
            {heading}
          </h1>
          {subheading ? <p className="text-gray-500 mt-2 text-lg">{subheading}</p> : null}
          <div className="w-24 h-px bg-gray-300 mt-4" />
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left button */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all hidden md:flex items-center justify-center w-12 h-12"
            type="button"
          >
            <ChevronLeftIcon />
          </button>

          {/* Cards */}
          <div ref={scrollContainerRef} className="flex items-center space-x-6 overflow-x-auto py-8">
            {Array.isArray(cards) &&
              cards.map((card, index) => (
                <CarouselCard
                  key={`${(card as CardLike)?.name ?? 'card'}-${index}`}
                  card={card as CardLike}
                  isEven={index % 2 === 0}
                />
              ))}
          </div>

          {/* Right button */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all hidden md:flex items-center justify-center w-12 h-12"
            type="button"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
};

export default UpDownCardCarousel;
