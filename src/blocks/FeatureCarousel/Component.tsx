'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { FeatureCarouselBlock as FeatureCarouselBlockProps } from '@/payload-types';

// Card component
const Card: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex-shrink-0 w-64 h-80 bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between m-4">
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

// Main component
export const FeatureCarousel: React.FC<FeatureCarouselBlockProps> = ({
  heading = 'Discover Our Features',
  subheading = 'Explore the powerful tools that make our platform the best choice for you.',
  cards = [],
  showNavigationButtons = true,
  scrollPercentage = 80,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const calculateWidths = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        setContainerWidth(clientWidth);
        setMaxScroll(scrollWidth - clientWidth);
      }
    };

    calculateWidths();
    window.addEventListener('resize', calculateWidths);

    return () => {
      window.removeEventListener('resize', calculateWidths);
    };
  }, [cards]);

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = containerWidth * ((scrollPercentage || 80) / 100);
    let newScrollPosition =
      direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;

    newScrollPosition = Math.max(0, Math.min(newScrollPosition, maxScroll));
    setScrollPosition(newScrollPosition);
  };

  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-center font-sans py-12">
      {/* ✅ Full width container with padding only on sides */}
      <div className="w-full px-8 md:px-16">
        {/* Header section */}
        <div className="text-left mb-8">
          <div className="flex items-center">
            <h1 className="text-4xl font-bold text-gray-800 whitespace-nowrap pr-6">{heading}</h1>
            <div className="w-full border-t border-dashed border-gray-400"></div>
          </div>
          {subheading && <p className="text-gray-600 mt-2">{subheading}</p>}
        </div>

        {/* ✅ Carousel section - full width */}
        <div className="relative">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#08121E] -z-10"></div>
          
          {/* Scrollable container */}
          <div className="overflow-hidden py-4">
            <div
              ref={containerRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {cards.map((item: any, index: number) => (
                <Card key={item?.id || index} title={item?.title || ''} description={item?.description || ''} />
              ))}
            </div>
          </div>

          {/* ✅ Navigation buttons - positioned relative to container */}
          {showNavigationButtons && (
            <div className="flex items-center mt-8">
              <div className="flex-grow border-t border-dashed border-gray-400 mr-6"></div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleScroll('left')}
                  disabled={scrollPosition === 0}
                  className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  disabled={scrollPosition >= maxScroll - 1}
                  className="w-12 h-12 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-300"
                  aria-label="Scroll right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCarousel;
