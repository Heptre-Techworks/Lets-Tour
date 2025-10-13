// src/blocks/ImageGrid/Component.tsx
'use client';

import * as React from 'react';
import { cn } from '@/utilities/ui';
import type { ImageGridBlock as ImageGridBlockProps } from '@/payload-types';

// Accept possible nulls from CMS types and normalize
type MaybeImage =
  | { url?: string | null; alt?: string | null }
  | string
  | null
  | undefined;

const getSrc = (img: MaybeImage): string | undefined =>
  typeof img === 'string' ? img : img?.url ?? undefined;

// Always return a string for alt; accept null in fallback
const getAlt = (img: MaybeImage, fallback?: string | null): string => {
  const candidate = typeof img === 'string' ? fallback : img?.alt ?? fallback;
  return candidate ?? '';
};

export const ImageGrid: React.FC<ImageGridBlockProps & { className?: string }> = ({
  leftHero,
  explore,
  spots,
  activities,
  labels,
  theme,
  className,
}) => {
  const wrap = !!theme?.container;
  const dark = !!theme?.dark;

  const leftHeroSrc = getSrc((leftHero?.image as any) ?? leftHero?.imageUrl);
  const leftHeroAlt = getAlt(
    (leftHero?.image as any) ?? leftHero?.imageUrl,
    (leftHero?.alt ?? leftHero?.title) ?? ''
  );

  const activitiesSrc = getSrc((activities?.image as any) ?? activities?.imageUrl);
  const activitiesAlt = getAlt(
    (activities?.image as any) ?? activities?.imageUrl,
    (activities?.alt ?? activities?.title) ?? ''
  );

  const spotsSafe = spots ?? [];

  return (
    <section
      className={cn(
        dark ? 'text-white bg-[#111111]' : 'text-black',
        wrap ? 'container' : '',
        'mx-auto',
        className
      )}
    >
      <main className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Left Hero */}
        <div className="relative col-span-1 lg:col-span-2 h-[400px] md:h-[600px] lg:h-auto rounded-lg overflow-hidden group">
          {leftHeroSrc && (
            <img
              src={leftHeroSrc}
              alt={leftHeroAlt}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          )}
          {(leftHero?.title || leftHero?.rating !== undefined || leftHero?.trail) && (
            <div className="absolute bottom-0 left-0 p-6 pl-16 w-full">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative flex items-baseline space-x-2 drop-shadow">
                {leftHero?.title && <h2 className="text-2xl md:text-3xl font-bold">{leftHero.title}</h2>}
                {typeof leftHero?.rating === 'number' && (
                  <span className="text-lg font-semibold text-gray-300">
                    {(labels?.ratingPrefix ?? '')}
                    {leftHero.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {leftHero?.trail && (
                <p className="relative text-sm font-semibold tracking-widest text-gray-400 mt-1">
                  {leftHero.trail}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Grid */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Column 1 */}
          <div className="flex flex-col gap-0">
            {/* Explore card */}
            {(explore?.subtitle ||
              explore?.title ||
              explore?.description ||
              explore?.button?.label) && (
              <div className="flex flex-col justify-center p-2 md:p-10 rounded-lg bg-[#1a1a1a]">
                {explore?.subtitle && (
                  <p className="text-sm font-semibold tracking-widest text-gray-400">{explore.subtitle}</p>
                )}
                {explore?.title && <h3 className="text-3xl md:text-4xl font-bold mt-4">{explore.title}</h3>}
                {explore?.description && <p className="text-gray-300 mt-4 leading-relaxed">{explore.description}</p>}
                {explore?.button?.label && (
                  <a
                    href={explore?.button?.href || '#'}
                    className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg self-start hover:bg-gray-200 transition-colors"
                  >
                    {explore.button.label}
                  </a>
                )}
              </div>
            )}

            {/* Spot index 1 */}
            {spotsSafe[1] && (
              <div className="relative rounded-lg overflow-hidden group">
                {getSrc((spotsSafe[1].image as any) ?? spotsSafe[1].imageUrl) && (
                  <img
                    src={getSrc((spotsSafe[1].image as any) ?? spotsSafe[1].imageUrl)!}
                    alt={getAlt(
                      (spotsSafe[1].image as any) ?? spotsSafe[1].imageUrl,
                      (spotsSafe[1].alt ?? spotsSafe[1].name) ?? ''
                    )}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                )}
                {(spotsSafe[1].name ||
                  spotsSafe[1].rating !== undefined ||
                  spotsSafe[1].location) && (
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative flex items-baseline space-x-2 drop-shadow">
                      {spotsSafe[1].name && <h4 className="text-lg font-bold">{spotsSafe[1].name}</h4>}
                      {typeof spotsSafe[1].rating === 'number' && (
                        <span className="text-md font-semibold text-gray-300">
                          {(labels?.ratingPrefix ?? '')}
                          {spotsSafe[1].rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {spotsSafe[1].location && (
                      <p className="relative text-xs font-semibold tracking-widest text-gray-400">
                        {spotsSafe[1].location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-0">
            {/* Spot index 0 */}
            {spotsSafe[0] && (
              <div className="relative rounded-lg overflow-hidden group">
                {getSrc((spotsSafe[0].image as any) ?? spotsSafe[0].imageUrl) && (
                  <img
                    src={getSrc((spotsSafe[0].image as any) ?? spotsSafe[0].imageUrl)!}
                    alt={getAlt(
                      (spotsSafe[0].image as any) ?? spotsSafe[0].imageUrl,
                      (spotsSafe[0].alt ?? spotsSafe[0].name) ?? ''
                    )}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                )}
                {(spotsSafe[0].name ||
                  spotsSafe[0].rating !== undefined ||
                  spotsSafe[0].location) && (
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative flex items-baseline space-x-2 drop-shadow">
                      {spotsSafe[0].name && <h4 className="text-lg font-bold">{spotsSafe[0].name}</h4>}
                      {typeof spotsSafe[0].rating === 'number' && (
                        <span className="text-md font-semibold text-gray-300">
                          {(labels?.ratingPrefix ?? '')}
                          {spotsSafe[0].rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {spotsSafe[0].location && (
                      <p className="relative text-xs font-semibold tracking-widest text-gray-400">
                        {spotsSafe[0].location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Spot index 2 */}
            {spotsSafe[2] && (
              <div className="relative rounded-lg overflow-hidden group">
                {getSrc((spotsSafe[2].image as any) ?? spotsSafe[2].imageUrl) && (
                  <img
                    src={getSrc((spotsSafe[2].image as any) ?? spotsSafe[2].imageUrl)!}
                    alt={getAlt(
                      (spotsSafe[2].image as any) ?? spotsSafe[2].imageUrl,
                      (spotsSafe[2].alt ?? spotsSafe[2].name) ?? ''
                    )}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                )}
                {(spotsSafe[2].name ||
                  spotsSafe[2].rating !== undefined ||
                  spotsSafe[2].location) && (
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="relative flex items-baseline space-x-2 drop-shadow">
                      {spotsSafe[2].name && <h4 className="text-lg font-bold">{spotsSafe[2].name}</h4>}
                      {typeof spotsSafe[2].rating === 'number' && (
                        <span className="text-md font-semibold text-gray-300">
                          {(labels?.ratingPrefix ?? '')}
                          {spotsSafe[2].rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {spotsSafe[2].location && (
                      <p className="relative text-xs font-semibold tracking-widest text-gray-400">
                        {spotsSafe[2].location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Activities */}
      {(activitiesSrc ||
        activities?.subtitle ||
        activities?.title ||
        activities?.description ||
        activities?.button?.label ||
        activities?.tag) && (
        <section className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden flex items-center group">
          {activitiesSrc && (
            <img
              src={activitiesSrc}
              alt={activitiesAlt}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/70 via-black/0 to-transparent" />
          <div className="relative z-10 p-6 md:p-12 max-w-lg">
            {activities?.subtitle && (
              <p className="text-sm font-semibold tracking-widest text-gray-300">{activities.subtitle}</p>
            )}
            {activities?.title && (
              <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight drop-shadow">{activities.title}</h2>
            )}
            {activities?.description && (
              <p className="text-gray-200 mt-4 leading-relaxed">{activities.description}</p>
            )}
            {activities?.button?.label && (
              <a
                href={activities?.button?.href || '#'}
                className="mt-8 inline-block px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {activities.button.label}
              </a>
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex items-center space-x-2 z-10">
            <button
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Previous"
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
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Next"
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

          {activities?.tag && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-gray-300 z-10 drop-shadow">
              {activities.tag}
            </p>
          )}
        </section>
      )}
    </section>
  );
};

export default ImageGrid;
