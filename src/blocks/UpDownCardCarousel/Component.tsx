// src/blocks/UpDownCarousel/Component.tsx
'use client';

import React, { useRef } from 'react';
import type { UpDownCardCarouselBlock as UpDownCardCarouselBlockProps } from '@/payload-types';

// Narrow media shape from Payload Upload relation (robust to partial population)
type MediaLike = { url?: string | null; alt?: string | null; sizes?: Record<string, { url?: string | null } | undefined> | null } | null | undefined;

// Local card helper type (Payload cards do not include href; handled as optional without affecting design)
type CardLike = {
  name?: string | null;
  details?: string | null;
  discount?: string | null;
  price?: number | string | null;
  image?: MediaLike | string | null;
  imageUrl?: string | null;
  alt?: string | null;
  href?: string | null;
};

const isMediaLike = (v: unknown): v is Exclude<MediaLike, string> =>
  !!v && typeof v === 'object' && ('url' in (v as Record<string, unknown>) || 'alt' in (v as Record<string, unknown>));

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (typeof img === 'string' && img) return img;
  if (isMediaLike(img)) {
    // prefer original url; if sizes exist, any preferred size key can be chosen here without design changes
    if (img?.url) return img.url;
    const sizes = img?.sizes || null;
    if (sizes) {
      for (const key of Object.keys(sizes)) {
        const s = sizes[key];
        if (s?.url) return s.url;
      }
    }
  }
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

// Dashed rule (kept exactly as provided)
const DashedRule: React.FC<{ className?: string }> = ({ className }) => {
  const style: React.CSSProperties = {
    ['--dash' as any]: '10px',
    ['--gap' as any]: '10px',
    ['--offset' as any]: '50px',
    backgroundImage:
      'repeating-linear-gradient(to right, currentColor 0 var(--dash), transparent 0 calc(var(--dash) + var(--gap)))',
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'calc(var(--dash) + var(--gap)) 1px',
    backgroundPosition: 'var(--offset) 0',
    height: '1px',
    width: '100%',
    opacity: 0.65,
  };
  return <div style={style} className={className} aria-hidden />;
};

// Child card component (design unchanged)
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

  const href = (card as any)?.href as string | undefined;

  return (
    <div
      className={`relative flex-shrink-0 w-[280px] h-[400px] rounded-2xl shadow-xl group transform transition-all duration-300 hover:scale-[1.02] ${
        isEven ? '-translate-y-4' : 'translate-y-4'
      }`}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={alt ?? 'Image'} className="w-full h-full object-cover transition-transform duration-300 rounded-2xl" />
      ) : (
        <div className="w-full h-full bg-gray-300 rounded-2xl" aria-hidden="true" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />

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
          {card?.details && <div className="w-full h-px bg-white/30 my-3" />}
          <div className="flex justify-between items-center mt-2">
            <div>
              <span className="text-2xl font-bold">₹ {formattedPrice}</span>
              <span className="text-sm opacity-80 ml-1">(per person)</span>
            </div>
          </div>
        </div>
      </div>

      <a
        href={href || '#'}
        onClick={e => !href && e.preventDefault()}
        className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:bg-gray-200 hover:scale-110 shadow-lg z-10 border-2 border-black"
        aria-label={`View details for ${card?.name}`}
      >
        <ArrowRightIcon />
      </a>
    </div>
  );
};

// Block component (props typed to Payload-generated interface)
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
    <section className="font-sans px-4 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
              {heading}
            </h1>
            <div className="flex-1 text-gray-400">
              <DashedRule />
            </div>
          </div>
          {subheading ? <p className="text-gray-600 mt-2 text-lg">{subheading}</p> : null}
        </div>

        {/* Carousel */}
        <div className="relative py-12 ">
          {/* Left button */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all hidden md:flex items-center justify-center w-12 h-12"
            type="button"
          >
            <ChevronLeftIcon />
          </button>

          {/* Cards */}
          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-8 py-12 px-4 -mx-4 overflow-x-auto"
            style={{ scrollbarWidth: 'none' } as any}
          >
            {Array.isArray(cards) &&
              cards.map((c, index) => {
                const card = c as unknown as CardLike;
                return (
                  <CarouselCard
                    key={`${card?.name ?? 'card'}-${index}`}
                    card={card}
                    isEven={index % 2 === 0}
                  />
                );
              })}
          </div>

          {/* Right button */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all hidden md:flex items-center justify-center w-12 h-12"
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
