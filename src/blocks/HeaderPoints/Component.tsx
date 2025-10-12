'use client';

import React from 'react';
import type { HeaderPointsBlock as HeaderPointsBlockProps } from '@/payload-types';

export const HeaderPoints: React.FC<HeaderPointsBlockProps> = ({
  heading = 'Heading',
  subheading = 'This is a subheading.',
  points = [],
  listStyle = 'decimal',
}) => {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  const listStyleClass = listStyle === 'disc' ? 'list-disc' : 'list-decimal';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-2xl bg-white p-10 rounded-xl shadow-md">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-gray-800">{heading}</h1>
          {subheading && <p className="text-gray-600 mt-2 mb-8">{subheading}</p>}
        </div>

        <div className="space-y-4">
          <ol className={`${listStyleClass} list-inside text-gray-700 space-y-3`}>
            {points.map((point: any, index: number) => (
              <li key={index}>{point?.text || point}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HeaderPoints;
