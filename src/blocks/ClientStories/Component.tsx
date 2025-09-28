// src/blocks/ClientStories/Component.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { ClientStoriesBlock as ClientStoriesBlockProps } from '@/payload-types';

type MediaLike = { url?: string | null; alt?: string | null };

const getImageSrc = (img?: MediaLike | string | null, url?: string | null) => {
  if (img && typeof img === 'object' && 'url' in img && img?.url) return img.url as string;
  if (url) return url;
  return '';
};

const StarRating: React.FC<{ rating?: number | null }> = ({ rating = 0 }) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex items-center" aria-label={`Rating ${safe} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < safe;
        return (
          <svg
            key={i}
            className={`w-5 h-5 ${on ? 'text-yellow-400' : 'text-gray-500'} fill-current`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        );
      })}
    </div>
  );
};

export const ClientStories: React.FC<ClientStoriesBlockProps> = ({
  heading = 'Our client stories!',
  subheading = 'Explore the wild west in all its glory this summer with your family and LetsTour',
  buttonText = 'View all',
  background,
  backgroundUrl,
  cardsPerView: cardsPerViewRaw = 2,
  gapPx: gapPxRaw = 24,
  cards = [],
}) => {
  const cardsPerView = Math.max(1, Number(cardsPerViewRaw) || 2);
  const gapPx = Math.max(0, Number(gapPxRaw) || 24);
  const totalSlides = useMemo(
    () => Math.max(1, Math.ceil((Array.isArray(cards) ? cards.length : 0) / cardsPerView)),
    [cards, cardsPerView],
  );
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    setCurrentSlide((s) => Math.min(Math.max(1, s), totalSlides));
  }, [totalSlides]);

  const handlePrev = () => setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1));
  const handleNext = () => setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1));

  // Percentage translate based on number of cards visible; gap is approximated by a % factor.
  const cardWidthPct = 100 / cardsPerView;
  const gapPctApprox = (gapPx / 1200) * 100; // assume ~1200px container for a mild, responsive-safe approximation
  const translatePct = (currentSlide - 1) * (cardWidthPct + gapPctApprox);

  const bgSrc = getImageSrc(background as any, backgroundUrl as any);

  return (
    <section className="relative w-full min-h-screen bg-gray-900 font-sans overflow-hidden text-white">
      {/* Background */}
      {bgSrc ? (
        <img
          src={bgSrc}
          alt={(background as any)?.alt || 'Background'}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
      )}

      <div className="relative z-10 flex flex-col justify-between min-h-screen p-8 md:p-16">
        <div className="flex flex-col lg:flex-row items-center w-full flex-grow">
          {/* Left column */}
          <div className="w-full lg:w-1/3 lg:pr-12 space-y-6 text-left mb-12 lg:mb-0">
            <h1 className="text-6xl md:text-7xl font-serif italic">{heading}</h1>
            {subheading ? <p className="text-lg text-gray-200">{subheading}</p> : null}
            {buttonText ? (
              <button
                type="button"
                className="bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors duration-300"
              >
                {buttonText}
              </button>
            ) : null}
          </div>

          {/* Right column */}
          <div className="w-full lg:w-2/3 overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${translatePct}%)` }}
              aria-live="polite"
            >
              {Array.isArray(cards) &&
                cards.map((card, idx) => (
                <div
                  key={`${card?.name ?? 'card'}-${idx}`}
                  className="flex-shrink-0"
                  style={{ width: `calc(${cardWidthPct}% - ${gapPx - gapPx / cardsPerView}px)` }}
                >
                  {/* Constant card height */}
                  <div className="h-[320px] p-6 bg-white/10 backdrop-blur-md rounded-2xl text-left">
                    <div className="flex flex-col h-full">
                      <div className="mb-4 shrink-0">
                        <h3 className="text-xl font-bold">{card?.name ?? ''}</h3>
                        <StarRating rating={card?.rating as number} />
                      </div>

                      {/* Scrollable story area */}
                      <div className="flex-1 overflow-y-auto overscroll-contain pr-2">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {card?.story ? `"${card.story}"` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                ))}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="relative mt-auto pt-10">
          {/* Wavy dashed line mask */}
          <div
            className="absolute top-0 left-0 w-full h-8"
            style={{
              background:
                "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='white' stroke-width='4' stroke-dasharray='50 30' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
              maskImage:
                'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIxIiBkPSJNMCAyMjRsMTIwLTIxLjNDMjQwIDIwMyA0ODAgMTYwIDcyMCAxNjBzNDgwIDQzIDcyMCA2NC4xTDk2MCAyMjRsLTgwIDQyLjdjLTgwIDQyLjYtMjQwIDEyOC00MDAgMTQ5LjMtMTYwIDIxLjQtMzIwLTIxLjQtNDgwLTMxLjlDMCwyNDUgMCwyMzQgMCwyMjR6Ij48L3BhdGg+PC9zdmc+")',
              maskSize: 'cover',
              maskRepeat: 'no-repeat',
            }}
          />
          <div className="flex items-center justify-between mt-6">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                aria-label="Previous"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-500/40 hover:bg-gray-500/60 transition-opacity"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-500/40 hover:bg-gray-500/60 transition-opacity"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex justify-end items-center">
              <div className="text-2xl font-semibold tracking-wider">
                {currentSlide}
                <span className="text-gray-400 mx-3">/</span>
                {totalSlides}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientStories;
